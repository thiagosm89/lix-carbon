import React, { useState, useEffect } from 'react';
import { Wallet, CheckCircle, Clock, DollarSign, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout/Layout';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import api from '../../services/api';
import './SolicitarPagamento.css';

const SolicitarPagamento = () => {
  const { user } = useAuth();
  const [registrosValidados, setRegistrosValidados] = useState([]);
  const [pagamentosPendentes, setPagamentosPendentes] = useState([]);
  const [historicoPagamentos, setHistoricoPagamentos] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);

  // Formatação segura de números
  const formatNumber = (value, decimals = 1) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '0.' + '0'.repeat(decimals);
    return num.toFixed(decimals);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [validadosRes, pendentesRes, historicoRes] = await Promise.all([
        api.get('/waste/meus-registros'),
        api.get('/payment/pendentes'),
        api.get('/payment/historico')
      ]);

      // Filtrar apenas registros validados (disponíveis para solicitar pagamento)
      const validados = validadosRes.data.registros.filter(
        r => r.status === 'VALIDADO'
      );
      setRegistrosValidados(validados);
      setPagamentosPendentes(pendentesRes.data.registros || []);
      setHistoricoPagamentos(historicoRes.data.registros || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === registrosValidados.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(registrosValidados.map(r => r.id));
    }
  };

  const handleSelectItem = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const calcularTotal = () => {
    return registrosValidados
      .filter(r => selectedIds.includes(r.id))
      .reduce((sum, r) => sum + r.credito, 0);
  };

  const handleSolicitarPagamento = async () => {
    if (selectedIds.length === 0) {
      setMessage({
        type: 'error',
        text: 'Selecione pelo menos um registro para solicitar pagamento'
      });
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/payment/solicitar', {
        registroIds: selectedIds
      });

      setMessage({
        type: 'success',
        text: response.data.message
      });

      setSelectedIds([]);
      await loadData();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Erro ao solicitar pagamento'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading && registrosValidados.length === 0) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando dados...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="pagamento-container">
        <div className="page-header">
          <div>
            <h1>Solicitar Pagamento</h1>
            <p>Gerencie seus créditos e solicite pagamentos</p>
          </div>
          <Button variant="outline" icon={RefreshCw} onClick={loadData}>
            Atualizar
          </Button>
        </div>

        {message && (
          <div className={`message message-${message.type}`}>
            {message.type === 'success' ? (
              <CheckCircle size={20} />
            ) : (
              <AlertCircle size={20} />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Resumo */}
        <div className="resumo-grid">
          <Card className="resumo-card">
            <div className="resumo-content">
              <div className="resumo-icon icon-disponivel">
                <DollarSign size={28} />
              </div>
              <div>
                <div className="resumo-label">Disponível para Saque</div>
                <div className="resumo-value">
                  {formatNumber(registrosValidados.reduce((sum, r) => sum + r.credito, 0), 2)}
                  <span className="resumo-unit">CO₂</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="resumo-card">
            <div className="resumo-content">
              <div className="resumo-icon icon-pendente">
                <Clock size={28} />
              </div>
              <div>
                <div className="resumo-label">Pagamento Pendente</div>
                <div className="resumo-value">
                  {formatNumber(pagamentosPendentes.reduce((sum, r) => sum + r.credito, 0), 2)}
                  <span className="resumo-unit">CO₂</span>
                </div>
              </div>
            </div>
          </Card>

          <Card className="resumo-card">
            <div className="resumo-content">
              <div className="resumo-icon icon-recebido">
                <CheckCircle size={28} />
              </div>
              <div>
                <div className="resumo-label">Total Recebido</div>
                <div className="resumo-value">
                  {formatNumber(historicoPagamentos.reduce((sum, r) => sum + r.credito, 0), 2)}
                  <span className="resumo-unit">CO₂</span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Solicitar Novo Pagamento */}
        <Card title="Solicitar Novo Pagamento" icon={Wallet}>
          {registrosValidados.length > 0 ? (
            <>
              <div className="selection-header">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === registrosValidados.length}
                    onChange={handleSelectAll}
                    className="checkbox-input"
                  />
                  <span>Selecionar Todos</span>
                </label>
                {selectedIds.length > 0 && (
                  <div className="selection-info">
                    {selectedIds.length} selecionado(s) • 
                    <strong> {formatNumber(calcularTotal(), 2)} CO₂</strong>
                  </div>
                )}
              </div>

              <div className="registros-list">
                {registrosValidados.map((registro) => (
                  <div
                    key={registro.id}
                    className={`registro-item ${selectedIds.includes(registro.id) ? 'selected' : ''}`}
                    onClick={() => handleSelectItem(registro.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(registro.id)}
                      onChange={() => {}}
                      className="checkbox-input"
                    />
                    <div className="registro-info">
                      <div className="registro-header">
                        <span className={`badge badge-${registro.categoria.toLowerCase()}`}>
                          {registro.categoria === 'RECICLAVEL' ? '♻️ Reciclável' : '🌿 Orgânico'}
                        </span>
                        <span className="registro-data">
                          {new Date(registro.dataCriacao).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                      <div className="registro-details">
                        <span className="registro-peso">{formatNumber(registro.peso)} kg</span>
                        <span className="registro-separator">•</span>
                        <span className="registro-token">Token: {registro.token}</span>
                      </div>
                    </div>
                    <div className="registro-credito">
                      {formatNumber(registro.credito, 2)} CO₂
                    </div>
                  </div>
                ))}
              </div>

              <div className="action-footer">
                <div className="total-section">
                  <span className="total-label">Total Selecionado:</span>
                  <span className="total-value">{formatNumber(calcularTotal(), 2)} CO₂</span>
                </div>
                <Button
                  variant="primary"
                  size="large"
                  icon={Wallet}
                  onClick={handleSolicitarPagamento}
                  disabled={selectedIds.length === 0 || loading}
                >
                  {loading ? 'Processando...' : 'Solicitar Pagamento'}
                </Button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <DollarSign size={64} />
              <h3>Nenhum crédito disponível</h3>
              <p>Você não possui créditos validados disponíveis para saque no momento</p>
            </div>
          )}
        </Card>

        {/* Pagamentos Pendentes */}
        {pagamentosPendentes.length > 0 && (
          <Card title="Pagamentos Pendentes de Aprovação" icon={Clock}>
            <div className="registros-table">
              <table>
                <thead>
                  <tr>
                    <th>Data Solicitação</th>
                    <th>Categoria</th>
                    <th>Peso</th>
                    <th>Crédito</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {pagamentosPendentes.map((registro) => (
                    <tr key={registro.id}>
                      <td>
                        {new Date(registro.dataSolicitacaoPagamento || registro.dataCriacao)
                          .toLocaleDateString('pt-BR')}
                      </td>
                      <td>
                        <span className={`badge badge-${registro.categoria.toLowerCase()}`}>
                          {registro.categoria === 'RECICLAVEL' ? '♻️ Reciclável' : '🌿 Orgânico'}
                        </span>
                      </td>
                      <td>{formatNumber(registro.peso)} kg</td>
                      <td className="credit-value">{formatNumber(registro.credito, 2)} CO₂</td>
                      <td>
                        <span className="status status-pendente">
                          ⏱ Aguardando Aprovação
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Histórico */}
        {historicoPagamentos.length > 0 && (
          <Card title="Histórico de Pagamentos" icon={CheckCircle}>
            <div className="registros-table">
              <table>
                <thead>
                  <tr>
                    <th>Data Pagamento</th>
                    <th>Categoria</th>
                    <th>Peso</th>
                    <th>Crédito</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {historicoPagamentos.map((registro) => (
                    <tr key={registro.id}>
                      <td>
                        {new Date(registro.dataPagamento)
                          .toLocaleDateString('pt-BR')}
                      </td>
                      <td>
                        <span className={`badge badge-${registro.categoria.toLowerCase()}`}>
                          {registro.categoria === 'RECICLAVEL' ? '♻️ Reciclável' : '🌿 Orgânico'}
                        </span>
                      </td>
                      <td>{formatNumber(registro.peso)} kg</td>
                      <td className="credit-value">{formatNumber(registro.credito, 2)} CO₂</td>
                      <td>
                        <span className="status status-pago">
                          ✓ Pago
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default SolicitarPagamento;

