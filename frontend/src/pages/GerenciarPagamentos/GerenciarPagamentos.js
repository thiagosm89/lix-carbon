import React, { useState, useEffect } from 'react';
import { Wallet, CheckCircle, AlertCircle, RefreshCw, DollarSign } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import api from '../../services/api';
import './GerenciarPagamentos.css';

const GerenciarPagamentos = () => {
  const [pagamentosPendentes, setPagamentosPendentes] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [users, setUsers] = useState({});

  // Formatação segura de números
  const formatNumber = (value, decimals = 1) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '0.' + '0'.repeat(decimals);
    return num.toFixed(decimals);
  };

  const formatMoney = (value) => {
    const num = parseFloat(value);
    if (isNaN(num)) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(num);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payment/disponiveis/todos');
      
      // Processar os dados para ter informações dos usuários
      const userMap = {};
      if (response.data.porUsuario) {
        Object.values(response.data.porUsuario).forEach(item => {
          userMap[item.userId] = item;
        });
      }
      
      setUsers(userMap);
      setPagamentosPendentes(response.data.porUsuario ? 
        Object.values(response.data.porUsuario).flatMap(u => u.registros) : 
        []
      );
    } catch (error) {
      console.error('Erro ao carregar pagamentos:', error);
      setMessage({
        type: 'error',
        text: 'Erro ao carregar pagamentos disponíveis'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === pagamentosPendentes.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pagamentosPendentes.map(p => p.id));
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
    return pagamentosPendentes
      .filter(p => selectedIds.includes(p.id))
      .reduce((sum, p) => sum + (p.valorProporcional || 0), 0);
  };

  const handleProcessarPagamentos = async () => {
    if (selectedIds.length === 0) {
      setMessage({
        type: 'error',
        text: 'Selecione pelo menos um pagamento para processar'
      });
      return;
    }

    try {
      setLoading(true);
      const response = await api.post('/payment/processar', {
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
        text: error.response?.data?.error || 'Erro ao processar pagamentos'
      });
    } finally {
      setLoading(false);
    }
  };

  const getUserInfo = (userId) => {
    return users[userId] || { userId };
  };

  if (loading && pagamentosPendentes.length === 0) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando pagamentos...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="gerenciar-pagamentos-container">
        <div className="page-header">
          <div>
            <h1>Gerenciar Pagamentos</h1>
            <p>Processe pagamentos de tokens liberados pela validadora</p>
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
              <div className="resumo-icon icon-pendente">
                <Wallet size={28} />
              </div>
              <div>
                <div className="resumo-label">Tokens Disponíveis</div>
                <div className="resumo-value">{pagamentosPendentes.length}</div>
              </div>
            </div>
          </Card>

          <Card className="resumo-card">
            <div className="resumo-content">
              <div className="resumo-icon icon-valor">
                <DollarSign size={28} />
              </div>
              <div>
                <div className="resumo-label">Valor Total Disponível</div>
                <div className="resumo-value">
                  {formatMoney(pagamentosPendentes.reduce((sum, p) => sum + (p.valorProporcional || 0), 0))}
                </div>
              </div>
            </div>
          </Card>

          <Card className="resumo-card">
            <div className="resumo-content">
              <div className="resumo-icon icon-selecionados">
                <CheckCircle size={28} />
              </div>
              <div>
                <div className="resumo-label">Selecionados</div>
                <div className="resumo-value">{selectedIds.length}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Lista de Pagamentos */}
        <Card title="Pagamentos Aguardando Aprovação" icon={Wallet}>
          {pagamentosPendentes.length > 0 ? (
            <>
              <div className="selection-header">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === pagamentosPendentes.length}
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

              <div className="pagamentos-list">
                {pagamentosPendentes.map((pagamento) => (
                  <div
                    key={pagamento.id}
                    className={`pagamento-item ${selectedIds.includes(pagamento.id) ? 'selected' : ''}`}
                    onClick={() => handleSelectItem(pagamento.id)}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(pagamento.id)}
                      onChange={() => {}}
                      className="checkbox-input"
                    />
                    <div className="pagamento-info">
                      <div className="pagamento-header">
                        <span className="pagamento-empresa">
                          Empresa: {getUserInfo(pagamento.userId).userId?.slice(0, 8)}
                        </span>
                        <span className={`badge badge-${pagamento.categoria.toLowerCase()}`}>
                          {pagamento.categoria === 'RECICLAVEL' ? '♻️ Reciclável' : '🌿 Orgânico'}
                        </span>
                      </div>
                      <div className="pagamento-details">
                        <span>Data: {new Date(pagamento.dataSolicitacaoPagamento || pagamento.dataCriacao).toLocaleString('pt-BR')}</span>
                        <span>•</span>
                        <span>Peso: {formatNumber(pagamento.peso)} kg</span>
                        <span>•</span>
                        <span>Token: {pagamento.token}</span>
                      </div>
                    </div>
                    <div className="pagamento-credito">
                      {formatMoney(pagamento.valorProporcional || 0)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="action-footer">
                <div className="total-section">
                  <span className="total-label">Total a Processar:</span>
                  <span className="total-value">{formatMoney(calcularTotal())}</span>
                </div>
                <Button
                  variant="primary"
                  size="large"
                  icon={CheckCircle}
                  onClick={handleProcessarPagamentos}
                  disabled={selectedIds.length === 0 || loading}
                >
                  {loading ? 'Processando...' : 'Aprovar e Pagar'}
                </Button>
              </div>
            </>
          ) : (
            <div className="empty-state">
              <Wallet size={64} />
              <h3>Nenhum token disponível</h3>
              <p>Não há tokens liberados pela validadora aguardando pagamento no momento</p>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default GerenciarPagamentos;

