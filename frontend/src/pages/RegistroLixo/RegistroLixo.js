import React, { useState, useEffect } from 'react';
import { Trash2, CheckCircle, AlertCircle, Hash, RefreshCw } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import api from '../../services/api';
import './RegistroLixo.css';

const RegistroLixo = () => {
  const [token, setToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [registros, setRegistros] = useState([]);
  const [estatisticas, setEstatisticas] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [registrosRes, statsRes] = await Promise.all([
        api.get('/waste/meus-registros'),
        api.get('/waste/estatisticas')
      ]);
      setRegistros(registrosRes.data.registros);
      setEstatisticas(statsRes.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    // Validar token
    if (token.length !== 6 || !/^\d{6}$/.test(token)) {
      setMessage({
        type: 'error',
        text: 'O token deve conter exatamente 6 dígitos numéricos'
      });
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/waste/registrar', { token });
      setMessage({
        type: 'success',
        text: response.data.message
      });
      setToken('');
      
      // Recarregar dados
      await loadData();
    } catch (error) {
      setMessage({
        type: 'error',
        text: error.response?.data?.error || 'Erro ao registrar lixo'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleTokenChange = (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    setToken(value);
    setMessage(null);
  };

  return (
    <Layout>
      <div className="registro-lixo-container">
        <div className="page-header">
          <div>
            <h1>Registrar Lixo</h1>
            <p>Informe o token gerado pelo totem para registrar sua coleta</p>
          </div>
          <Button variant="outline" icon={RefreshCw} onClick={loadData}>
            Atualizar
          </Button>
        </div>

        <div className="registro-grid">
          {/* Formulário de Registro */}
          <Card title="Inserir Token do Totem" icon={Hash} className="registro-form-card">
            <form onSubmit={handleSubmit} className="token-form">
              <div className="token-input-container">
                <div className="token-input-wrapper">
                  <input
                    type="text"
                    value={token}
                    onChange={handleTokenChange}
                    placeholder="000000"
                    className="token-input"
                    maxLength="6"
                    disabled={loading}
                  />
                  <div className="token-hint">
                    Token de 6 dígitos
                  </div>
                </div>
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

              <Button
                type="submit"
                variant="primary"
                fullWidth
                size="large"
                icon={Trash2}
                disabled={loading || token.length !== 6}
              >
                {loading ? 'Registrando...' : 'Registrar Lixo'}
              </Button>
            </form>

            <div className="info-box">
              <h4>Como funciona?</h4>
              <ol>
                <li>Deposite seu lixo no totem de coleta</li>
                <li>Selecione a categoria (Reciclável ou Orgânico)</li>
                <li>O totem pesará e gerará um token de 6 dígitos</li>
                <li>Insira o token aqui para registrar em sua conta</li>
              </ol>
            </div>

            <div className="tokens-exemplo">
              <strong>Tokens de Teste Disponíveis:</strong>
              <div className="token-list">
                <button 
                  className="token-chip"
                  onClick={() => setToken('789012')}
                  type="button"
                >
                  789012 - Reciclável 180kg
                </button>
                <button 
                  className="token-chip"
                  onClick={() => setToken('890123')}
                  type="button"
                >
                  890123 - Orgânico 220kg
                </button>
                <button 
                  className="token-chip"
                  onClick={() => setToken('901234')}
                  type="button"
                >
                  901234 - Reciclável 275.5kg
                </button>
              </div>
            </div>
          </Card>

          {/* Estatísticas */}
          {estatisticas && (
            <Card title="Suas Estatísticas" icon={Trash2}>
              <div className="stats-summary">
                <div className="summary-item">
                  <div className="summary-label">Total Coletado</div>
                  <div className="summary-value">
                    {estatisticas.totalPeso.toFixed(1)}
                    <span className="summary-unit">kg</span>
                  </div>
                </div>
                <div className="summary-item">
                  <div className="summary-label">Total de Coletas</div>
                  <div className="summary-value primary">
                    {estatisticas.porCategoria.RECICLAVEL.quantidade + estatisticas.porCategoria.ORGANICO.quantidade}
                  </div>
                </div>
              </div>

              <div className="category-breakdown">
                <div className="breakdown-item">
                  <div className="breakdown-header">
                    <span className="breakdown-label">♻️ Recicláveis</span>
                    <span className="breakdown-count">
                      {estatisticas.porCategoria.RECICLAVEL.quantidade} coletas
                    </span>
                  </div>
                  <div className="breakdown-values">
                    <div className="breakdown-value">
                      {estatisticas.porCategoria.RECICLAVEL.peso.toFixed(1)} kg
                    </div>
                  </div>
                </div>

                <div className="breakdown-item">
                  <div className="breakdown-header">
                    <span className="breakdown-label">🌿 Orgânicos</span>
                    <span className="breakdown-count">
                      {estatisticas.porCategoria.ORGANICO.quantidade} coletas
                    </span>
                  </div>
                  <div className="breakdown-values">
                    <div className="breakdown-value">
                      {estatisticas.porCategoria.ORGANICO.peso.toFixed(1)} kg
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Histórico de Registros */}
        <Card title="Histórico de Registros" icon={Trash2}>
          {registros.length > 0 ? (
            <div className="registros-table">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Token</th>
                    <th>Categoria</th>
                    <th>Peso</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {registros.map((registro) => (
                    <tr key={registro.id}>
                      <td>
                        {new Date(registro.dataCriacao).toLocaleString('pt-BR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </td>
                      <td>
                        <code className="token-code">{registro.token}</code>
                      </td>
                      <td>
                        <span className={`badge badge-${registro.categoria.toLowerCase()}`}>
                          {registro.categoria === 'RECICLAVEL' ? '♻️ Reciclável' : '🌿 Orgânico'}
                        </span>
                      </td>
                      <td>{registro.peso.toFixed(1)} kg</td>
                      <td>
                        <span className={`status status-${registro.status.toLowerCase()}`}>
                          {registro.status === 'VALIDADO' && '✓ Validado'}
                          {registro.status === 'PENDENTE_PAGAMENTO' && '⏱ Pend. Pagamento'}
                          {registro.status === 'PAGO' && '✓ Pago'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty-state">
              <Trash2 size={64} />
              <h3>Nenhum registro ainda</h3>
              <p>Comece registrando seu primeiro lixo usando um token do totem</p>
            </div>
          )}
        </Card>
      </div>
    </Layout>
  );
};

export default RegistroLixo;

