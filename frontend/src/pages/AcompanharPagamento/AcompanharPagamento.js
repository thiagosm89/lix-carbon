import React, { useState, useEffect } from 'react';
import { Clock, DollarSign, CheckCircle, RefreshCw, ChevronDown, ChevronUp, Package, TrendingUp } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import api from '../../services/api';
import './AcompanharPagamento.css';

const AcompanharPagamento = () => {
  const [dados, setDados] = useState(null);
  const [mostrarPagos, setMostrarPagos] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/payment/acompanhar');
      setDados(response.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'VALIDADO': { label: 'Aguardando Lote', className: 'status-validado', icon: Clock },
      'ENVIADO_VALIDADORA': { label: 'Enviado à Validadora', className: 'status-enviado', icon: Package },
      'LIBERADO_PAGAMENTO': { label: 'Disponível para Saque', className: 'status-liberado', icon: TrendingUp },
      'PAGO': { label: 'Pago', className: 'status-pago', icon: CheckCircle }
    };

    const badge = badges[status] || { label: status, className: '', icon: Clock };
    const Icon = badge.icon;

    return (
      <span className={`status-badge ${badge.className}`}>
        <Icon size={14} />
        {badge.label}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatMoney = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (loading) {
    return (
      <Layout>
        <div className="acompanhar-pagamento-loading">
          <RefreshCw className="spin" size={48} />
          <p>Carregando...</p>
        </div>
      </Layout>
    );
  }

  if (!dados) {
    return (
      <Layout>
        <div className="acompanhar-pagamento-error">
          <p>Erro ao carregar dados.</p>
          <Button onClick={loadData}>Tentar Novamente</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="acompanhar-pagamento">
        <div className="page-header">
          <div>
            <h1>Acompanhar Pagamentos</h1>
            <p>Visualize o status dos seus tokens e valores disponíveis</p>
          </div>
          <Button onClick={loadData} variant="secondary">
            <RefreshCw size={18} />
            Atualizar
          </Button>
        </div>

        {/* Cards de Resumo */}
        <div className="summary-cards">
          <Card className="summary-card pendentes">
            <div className="summary-icon">
              <Clock size={32} />
            </div>
            <div className="summary-content">
              <h3>Pendentes</h3>
              <p className="summary-value">{dados.pendentes.quantidade}</p>
              <p className="summary-label">tokens ({dados.pendentes.totalPeso.toFixed(1)} kg)</p>
              <p className="summary-description">{dados.pendentes.descricao}</p>
            </div>
          </Card>

          <Card className="summary-card disponiveis">
            <div className="summary-icon">
              <DollarSign size={32} />
            </div>
            <div className="summary-content">
              <h3>Disponível para Saque</h3>
              <p className="summary-value">{formatMoney(dados.disponiveis.totalValor)}</p>
              <p className="summary-label">{dados.disponiveis.quantidade} tokens</p>
              <p className="summary-description">{dados.disponiveis.descricao}</p>
            </div>
          </Card>

          <Card className="summary-card pagos">
            <div className="summary-icon">
              <CheckCircle size={32} />
            </div>
            <div className="summary-content">
              <h3>Já Pagos</h3>
              <p className="summary-value">{formatMoney(dados.pagos.totalValor)}</p>
              <p className="summary-label">{dados.pagos.quantidade} tokens</p>
            </div>
          </Card>
        </div>

        {/* Tokens Pendentes */}
        {dados.pendentes.quantidade > 0 && (
          <Card className="tokens-section">
            <div className="section-header">
              <h2>
                <Clock size={24} />
                Tokens Pendentes
              </h2>
              <span className="badge badge-warning">{dados.pendentes.quantidade}</span>
            </div>
            <p className="section-description">
              Tokens aguardando processamento. Eles serão incluídos em um lote e enviados à validadora para pagamento.
            </p>
            <div className="tokens-table">
              <table>
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Categoria</th>
                    <th>Peso</th>
                    <th>Status</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.pendentes.registros.map((registro) => (
                    <tr key={registro.id}>
                      <td><code>{registro.token}</code></td>
                      <td>
                        <span className={`categoria-badge ${registro.categoria.toLowerCase()}`}>
                          {registro.categoria}
                        </span>
                      </td>
                      <td>{registro.peso.toFixed(1)} kg</td>
                      <td>{getStatusBadge(registro.status)}</td>
                      <td>{formatDate(registro.dataCriacao)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Tokens Disponíveis para Saque */}
        {dados.disponiveis.quantidade > 0 && (
          <Card className="tokens-section highlight">
            <div className="section-header">
              <h2>
                <DollarSign size={24} />
                Disponível para Saque
              </h2>
              <span className="badge badge-success">{formatMoney(dados.disponiveis.totalValor)}</span>
            </div>
            <p className="section-description">
              Tokens liberados pela validadora. O administrador processará o pagamento em breve.
            </p>
            <div className="tokens-table">
              <table>
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Categoria</th>
                    <th>Peso</th>
                    <th>Lote</th>
                    <th>Valor</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {dados.disponiveis.registros.map((registro) => (
                    <tr key={registro.id} className="available-row">
                      <td><code>{registro.token}</code></td>
                      <td>
                        <span className={`categoria-badge ${registro.categoria.toLowerCase()}`}>
                          {registro.categoria}
                        </span>
                      </td>
                      <td>{registro.peso.toFixed(1)} kg</td>
                      <td><code className="lote-id">{registro.loteId?.slice(0, 8)}...</code></td>
                      <td className="valor-destaque">{formatMoney(registro.valorProporcional)}</td>
                      <td>{formatDate(registro.dataCriacao)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Mensagem se não há pendentes nem disponíveis */}
        {dados.pendentes.quantidade === 0 && dados.disponiveis.quantidade === 0 && (
          <Card className="empty-state">
            <Clock size={64} />
            <h3>Nenhum token pendente</h3>
            <p>Registre novos tokens de lixo para começar a acumular valores.</p>
          </Card>
        )}

        {/* Tokens Pagos (ocultos por padrão) */}
        {dados.pagos.quantidade > 0 && (
          <Card className="tokens-section">
            <div 
              className="section-header clickable"
              onClick={() => setMostrarPagos(!mostrarPagos)}
            >
              <h2>
                <CheckCircle size={24} />
                Histórico de Pagamentos
              </h2>
              <div className="section-header-right">
                <span className="badge badge-secondary">{dados.pagos.quantidade} pagos</span>
                {mostrarPagos ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
              </div>
            </div>

            {mostrarPagos && (
              <>
                <p className="section-description">
                  Tokens já pagos pelo administrador.
                </p>
                <div className="tokens-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Token</th>
                        <th>Categoria</th>
                        <th>Peso</th>
                        <th>Lote</th>
                        <th>Valor Pago</th>
                        <th>Data Pagamento</th>
                      </tr>
                    </thead>
                    <tbody>
                      {dados.pagos.registros.map((registro) => (
                        <tr key={registro.id} className="paid-row">
                          <td><code>{registro.token}</code></td>
                          <td>
                            <span className={`categoria-badge ${registro.categoria.toLowerCase()}`}>
                              {registro.categoria}
                            </span>
                          </td>
                          <td>{registro.peso.toFixed(1)} kg</td>
                          <td><code className="lote-id">{registro.loteId?.slice(0, 8)}...</code></td>
                          <td className="valor-pago">{formatMoney(registro.valorProporcional)}</td>
                          <td>{formatDate(registro.dataPagamento)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </Card>
        )}
      </div>
    </Layout>
  );
};

export default AcompanharPagamento;

