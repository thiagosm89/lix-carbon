import React, { useState, useEffect } from 'react';
import { Package, Plus, DollarSign, CheckCircle, Clock, Eye, RefreshCw, AlertCircle } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import api from '../../services/api';
import './GerenciarLotes.css';

const GerenciarLotes = () => {
  const [lotes, setLotes] = useState([]);
  const [tokensDisponiveis, setTokensDisponiveis] = useState([]);
  const [pesoMaximo, setPesoMaximo] = useState(1000);
  const [simulacao, setSimulacao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [criandoLote, setCriandoLote] = useState(false);
  const [loteDetalhes, setLoteDetalhes] = useState(null);
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [message, setMessage] = useState(null);

  // Modal de pagamento
  const [modalPagamento, setModalPagamento] = useState(null);
  const [valorPagamento, setValorPagamento] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (pesoMaximo > 0) {
      simularLote();
    }
  }, [pesoMaximo, tokensDisponiveis]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [lotesRes, tokensRes] = await Promise.all([
        api.get('/lote/listar'),
        api.get('/waste/disponiveis-lote') // Pegar tokens VALIDADOS de todos os usuários
      ]);

      setLotes(lotesRes.data.lotes || []);
      setTokensDisponiveis(tokensRes.data.registros || []);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      setMessage({ type: 'error', text: error.response?.data?.error || 'Erro ao carregar dados' });
    } finally {
      setLoading(false);
    }
  };

  const simularLote = () => {
    if (!tokensDisponiveis || tokensDisponiveis.length === 0) {
      setSimulacao(null);
      return;
    }

    // Simular seleção (mesmo algoritmo do backend)
    let pesoAcumulado = 0;
    const tokensSelecionados = [];

    for (const token of tokensDisponiveis) {
      if (pesoAcumulado + token.peso <= pesoMaximo) {
        tokensSelecionados.push(token);
        pesoAcumulado += token.peso;
      } else {
        if (tokensSelecionados.length > 0) break;
        tokensSelecionados.push(token);
        pesoAcumulado += token.peso;
        break;
      }
    }

    setSimulacao({
      quantidade: tokensSelecionados.length,
      pesoTotal: pesoAcumulado,
      tokens: tokensSelecionados
    });
  };

  const handleCriarLote = async () => {
    if (!pesoMaximo || pesoMaximo <= 0) {
      setMessage({ type: 'error', text: 'Peso máximo deve ser maior que zero' });
      return;
    }

    if (!simulacao || simulacao.quantidade === 0) {
      setMessage({ type: 'error', text: 'Não há tokens disponíveis para criar lote' });
      return;
    }

    try {
      setCriandoLote(true);
      const response = await api.post('/lote/criar', { pesoMaximo });
      
      setMessage({ 
        type: 'success', 
        text: `Lote criado com sucesso! ${response.data.lote.quantidadeTokens} tokens incluídos.` 
      });
      
      setPesoMaximo(1000);
      setMostrarFormulario(false);
      loadData();
    } catch (error) {
      console.error('Erro ao criar lote:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Erro ao criar lote' 
      });
    } finally {
      setCriandoLote(false);
    }
  };

  const handleVerDetalhes = async (loteId) => {
    try {
      const response = await api.get(`/lote/${loteId}`);
      setLoteDetalhes(response.data);
    } catch (error) {
      console.error('Erro ao buscar detalhes:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar detalhes do lote' });
    }
  };

  const handleAbrirModalPagamento = (lote) => {
    setModalPagamento(lote);
    setValorPagamento('');
  };

  const handleMarcarComoPago = async () => {
    if (!valorPagamento || parseFloat(valorPagamento) <= 0) {
      setMessage({ type: 'error', text: 'Valor deve ser maior que zero' });
      return;
    }

    try {
      await api.post('/lote/marcar-pago', {
        loteId: modalPagamento.id,
        valorPago: parseFloat(valorPagamento)
      });

      setMessage({ 
        type: 'success', 
        text: 'Lote marcado como pago! Valores distribuídos aos usuários.' 
      });
      
      setModalPagamento(null);
      setValorPagamento('');
      loadData();
    } catch (error) {
      console.error('Erro ao marcar como pago:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Erro ao processar pagamento' 
      });
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      'PENDENTE_VALIDADORA': { label: 'Aguardando Validadora', className: 'status-pendente', icon: Clock },
      'PAGO_VALIDADORA': { label: 'Pago pela Validadora', className: 'status-pago', icon: CheckCircle },
      'PAGO_USUARIOS': { label: 'Pago aos Usuários', className: 'status-concluido', icon: CheckCircle }
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
    }).format(value || 0);
  };

  if (loading) {
    return (
      <Layout>
        <div className="gerenciar-lotes-loading">
          <RefreshCw className="spin" size={48} />
          <p>Carregando...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="gerenciar-lotes">
        <div className="page-header">
          <div>
            <h1>Gerenciar Lotes</h1>
            <p>Crie lotes de tokens para enviar à validadora</p>
          </div>
          <div className="header-actions">
            <Button onClick={loadData} variant="secondary">
              <RefreshCw size={18} />
              Atualizar
            </Button>
            <Button onClick={() => setMostrarFormulario(!mostrarFormulario)} variant="primary">
              <Plus size={18} />
              Novo Lote
            </Button>
          </div>
        </div>

        {message && (
          <div className={`message message-${message.type}`}>
            {message.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
            <span>{message.text}</span>
            <button onClick={() => setMessage(null)}>×</button>
          </div>
        )}

        {/* Tokens Disponíveis */}
        {tokensDisponiveis.length > 0 && !mostrarFormulario && (
          <Card>
            <h2>
              <Clock size={24} />
              Tokens Aguardando Lote
            </h2>
            <p className="info-text">
              {tokensDisponiveis.length} tokens VALIDADOS aguardando para serem incluídos em um lote. 
              Os mais antigos serão selecionados primeiro.
            </p>
            <div className="tokens-preview">
              <table>
                <thead>
                  <tr>
                    <th>Token</th>
                    <th>Empresa</th>
                    <th>Categoria</th>
                    <th>Peso</th>
                    <th>Data</th>
                  </tr>
                </thead>
                <tbody>
                  {tokensDisponiveis.slice(0, 10).map((token) => (
                    <tr key={token.id}>
                      <td><code>{token.token}</code></td>
                      <td>{token.nomeEmpresa}</td>
                      <td>
                        <span className={`categoria-badge ${token.categoria.toLowerCase()}`}>
                          {token.categoria}
                        </span>
                      </td>
                      <td>{token.peso.toFixed(1)} kg</td>
                      <td>{formatDate(token.dataCriacao)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {tokensDisponiveis.length > 10 && (
                <div className="more-tokens">
                  +{tokensDisponiveis.length - 10} tokens não exibidos
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Formulário de Criar Lote */}
        {mostrarFormulario && (
          <Card className="form-card">
            <h2>
              <Plus size={24} />
              Criar Novo Lote
            </h2>

            <div className="form-group">
              <label>Peso Máximo do Lote (kg)</label>
              <input
                type="number"
                value={pesoMaximo}
                onChange={(e) => setPesoMaximo(parseFloat(e.target.value) || 0)}
                min="0"
                step="0.1"
                placeholder="Ex: 1000"
              />
            </div>

            {tokensDisponiveis.length === 0 && (
              <div className="alert alert-warning">
                <AlertCircle size={20} />
                Não há tokens disponíveis para criar lote. Aguarde novos registros.
              </div>
            )}

            {simulacao && simulacao.quantidade > 0 && (
              <div className="simulacao">
                <h3>📊 Simulação do Lote</h3>
                <div className="simulacao-stats">
                  <div className="sim-stat">
                    <span className="sim-label">Tokens Disponíveis</span>
                    <span className="sim-value">{tokensDisponiveis.length}</span>
                  </div>
                  <div className="sim-stat highlight">
                    <span className="sim-label">Tokens a Incluir</span>
                    <span className="sim-value">{simulacao.quantidade}</span>
                  </div>
                  <div className="sim-stat highlight">
                    <span className="sim-label">Peso Total</span>
                    <span className="sim-value">{simulacao.pesoTotal.toFixed(1)} kg</span>
                  </div>
                </div>

                {simulacao.pesoTotal > pesoMaximo && (
                  <div className="alert alert-info">
                    <AlertCircle size={16} />
                    Peso excede o máximo, mas todos os tokens serão incluídos (não é possível dividir).
                  </div>
                )}
              </div>
            )}

            <div className="form-actions">
              <Button 
                onClick={() => setMostrarFormulario(false)} 
                variant="secondary"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCriarLote} 
                variant="primary"
                disabled={criandoLote || !simulacao || simulacao.quantidade === 0}
              >
                {criandoLote ? 'Criando...' : 'Criar Lote'}
              </Button>
            </div>
          </Card>
        )}

        {/* Lista de Lotes */}
        <Card>
          <h2>
            <Package size={24} />
            Lotes Criados
          </h2>

          {lotes.length === 0 ? (
            <div className="empty-state">
              <Package size={64} />
              <h3>Nenhum lote criado</h3>
              <p>Crie o primeiro lote para enviar tokens à validadora.</p>
            </div>
          ) : (
            <div className="lotes-table">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Data</th>
                    <th>Peso</th>
                    <th>Tokens</th>
                    <th>Valor</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {lotes.map((lote) => (
                    <tr key={lote.id}>
                      <td><code>{lote.id.slice(0, 8)}...</code></td>
                      <td>{formatDate(lote.dataCriacao)}</td>
                      <td>{lote.pesoUtilizado.toFixed(1)} kg</td>
                      <td>{lote.quantidadeTokens}</td>
                      <td>{formatMoney(lote.valorPago)}</td>
                      <td>{getStatusBadge(lote.status)}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="btn-icon"
                            onClick={() => handleVerDetalhes(lote.id)}
                            title="Ver detalhes"
                          >
                            <Eye size={18} />
                          </button>
                          {lote.status === 'PENDENTE_VALIDADORA' && (
                            <button
                              className="btn-icon btn-primary"
                              onClick={() => handleAbrirModalPagamento(lote)}
                              title="Marcar como pago"
                            >
                              <DollarSign size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Modal de Detalhes */}
        {loteDetalhes && (
          <div className="modal-overlay" onClick={() => setLoteDetalhes(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Detalhes do Lote</h2>
                <button onClick={() => setLoteDetalhes(null)}>×</button>
              </div>
              <div className="modal-body">
                <div className="detalhes-grid">
                  <div className="detalhe-item">
                    <span className="detalhe-label">ID</span>
                    <code>{loteDetalhes.lote.id}</code>
                  </div>
                  <div className="detalhe-item">
                    <span className="detalhe-label">Status</span>
                    {getStatusBadge(loteDetalhes.lote.status)}
                  </div>
                  <div className="detalhe-item">
                    <span className="detalhe-label">Peso Utilizado</span>
                    <span>{loteDetalhes.lote.pesoUtilizado.toFixed(1)} kg</span>
                  </div>
                  <div className="detalhe-item">
                    <span className="detalhe-label">Tokens</span>
                    <span>{loteDetalhes.lote.quantidadeTokens}</span>
                  </div>
                  <div className="detalhe-item">
                    <span className="detalhe-label">Valor Pago</span>
                    <span>{formatMoney(loteDetalhes.lote.valorPago)}</span>
                  </div>
                  <div className="detalhe-item">
                    <span className="detalhe-label">Data Criação</span>
                    <span>{formatDate(loteDetalhes.lote.dataCriacao)}</span>
                  </div>
                </div>

                <h3>Tokens do Lote</h3>
                <div className="tokens-list">
                  <table>
                    <thead>
                      <tr>
                        <th>Token</th>
                        <th>Empresa</th>
                        <th>Categoria</th>
                        <th>Peso</th>
                        <th>Valor</th>
                      </tr>
                    </thead>
                    <tbody>
                      {loteDetalhes.tokens.map((token) => (
                        <tr key={token.id}>
                          <td><code>{token.token}</code></td>
                          <td>{token.nomeEmpresa}</td>
                          <td>
                            <span className={`categoria-badge ${token.categoria.toLowerCase()}`}>
                              {token.categoria}
                            </span>
                          </td>
                          <td>{token.peso.toFixed(1)} kg</td>
                          <td>{formatMoney(token.valorProporcional)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal de Pagamento */}
        {modalPagamento && (
          <div className="modal-overlay" onClick={() => setModalPagamento(null)}>
            <div className="modal modal-small" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Marcar Lote como Pago</h2>
                <button onClick={() => setModalPagamento(null)}>×</button>
              </div>
              <div className="modal-body">
                <p>Lote: <code>{modalPagamento.id.slice(0, 8)}...</code></p>
                <p>Peso: <strong>{modalPagamento.pesoUtilizado.toFixed(1)} kg</strong></p>
                <p>Tokens: <strong>{modalPagamento.quantidadeTokens}</strong></p>

                <div className="form-group">
                  <label>Valor Pago pela Validadora (USD)</label>
                  <input
                    type="number"
                    value={valorPagamento}
                    onChange={(e) => setValorPagamento(e.target.value)}
                    min="0"
                    step="0.01"
                    placeholder="Ex: 100.00"
                    autoFocus
                  />
                </div>

                {valorPagamento && parseFloat(valorPagamento) > 0 && (
                  <div className="calculo-preview">
                    <h4>Distribuição</h4>
                    <div className="calc-item">
                      <span>Valor Total:</span>
                      <span>{formatMoney(parseFloat(valorPagamento))}</span>
                    </div>
                    <div className="calc-item">
                      <span>Taxa LixCarbon (20%):</span>
                      <span>{formatMoney(parseFloat(valorPagamento) * 0.2)}</span>
                    </div>
                    <div className="calc-item highlight">
                      <span>Para Usuários (80%):</span>
                      <span>{formatMoney(parseFloat(valorPagamento) * 0.8)}</span>
                    </div>
                  </div>
                )}

                <div className="modal-actions">
                  <Button onClick={() => setModalPagamento(null)} variant="secondary">
                    Cancelar
                  </Button>
                  <Button onClick={handleMarcarComoPago} variant="primary">
                    Confirmar Pagamento
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GerenciarLotes;

