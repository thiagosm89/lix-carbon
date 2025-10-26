import React, { useState, useEffect } from 'react';
import { Building2, Plus, Edit2, Trash2, Power, RefreshCw, Search, CheckCircle, XCircle } from 'lucide-react';
import Layout from '../../components/Layout/Layout';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import api from '../../services/api';
import './GerenciarValidadoras.css';

const GerenciarValidadoras = () => {
  const [validadoras, setValidadoras] = useState([]);
  const [stats, setStats] = useState({ total: 0, ativas: 0, inativas: 0 });
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' ou 'edit'
  const [selectedValidadora, setSelectedValidadora] = useState(null);
  const [formData, setFormData] = useState({
    nomeEmpresa: '',
    cnpj: '',
    email: '',
    telefone: '',
    endereco: '',
    responsavel: '',
    ativa: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/validadora');
      setValidadoras(response.data.validadoras || []);
      setStats(response.data.stats || { total: 0, ativas: 0, inativas: 0 });
    } catch (error) {
      console.error('Erro ao carregar validadoras:', error);
      setMessage({ type: 'error', text: 'Erro ao carregar validadoras' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const formatCNPJ = (cnpj) => {
    return cnpj
      .replace(/\D/g, '')
      .replace(/^(\d{2})(\d)/, '$1.$2')
      .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d)/, '.$1/$2')
      .replace(/(\d{4})(\d)/, '$1-$2')
      .slice(0, 18);
  };

  const handleCNPJChange = (e) => {
    const formatted = formatCNPJ(e.target.value);
    setFormData(prev => ({ ...prev, cnpj: formatted }));
  };

  const openCreateModal = () => {
    setModalMode('create');
    setFormData({
      nomeEmpresa: '',
      cnpj: '',
      email: '',
      telefone: '',
      endereco: '',
      responsavel: '',
      ativa: true
    });
    setShowModal(true);
  };

  const openEditModal = (validadora) => {
    setModalMode('edit');
    setSelectedValidadora(validadora);
    setFormData({
      nomeEmpresa: validadora.nomeempresa || '',
      cnpj: validadora.cnpj || '',
      email: validadora.email || '',
      telefone: validadora.telefone || '',
      endereco: validadora.endereco || '',
      responsavel: validadora.responsavel || '',
      ativa: validadora.ativa
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (modalMode === 'create') {
        await api.post('/validadora', formData);
        setMessage({ type: 'success', text: 'Validadora cadastrada com sucesso!' });
      } else {
        await api.put(`/validadora/${selectedValidadora.id}`, formData);
        setMessage({ type: 'success', text: 'Validadora atualizada com sucesso!' });
      }
      
      setShowModal(false);
      loadData();
      
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Erro ao salvar validadora:', error);
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'Erro ao salvar validadora' 
      });
    }
  };

  const handleToggleAtiva = async (id) => {
    try {
      await api.patch(`/validadora/${id}/toggle`);
      setMessage({ type: 'success', text: 'Status alterado com sucesso!' });
      loadData();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Erro ao alternar status:', error);
      setMessage({ type: 'error', text: 'Erro ao alternar status' });
    }
  };

  const handleDelete = async (id, nomeEmpresa) => {
    if (!window.confirm(`Tem certeza que deseja excluir a validadora "${nomeEmpresa}"?`)) {
      return;
    }

    try {
      await api.delete(`/validadora/${id}`);
      setMessage({ type: 'success', text: 'Validadora excluída com sucesso!' });
      loadData();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Erro ao excluir validadora:', error);
      setMessage({ type: 'error', text: 'Erro ao excluir validadora' });
    }
  };

  const filteredValidadoras = validadoras.filter(v =>
    v.nomeempresa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.cnpj?.includes(searchTerm) ||
    v.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <RefreshCw className="loading-icon" size={48} />
          <p>Carregando...</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="gerenciar-validadoras-container">
        <div className="page-header">
          <div>
            <h1>Gerenciar Validadoras</h1>
            <p>Cadastre e gerencie as empresas validadoras de crédito</p>
          </div>
          <Button variant="primary" icon={Plus} onClick={openCreateModal}>
            Nova Validadora
          </Button>
        </div>

        {message && (
          <div className={`alert alert-${message.type}`}>
            {message.type === 'success' ? <CheckCircle size={20} /> : <XCircle size={20} />}
            {message.text}
          </div>
        )}

        {/* Stats Cards */}
        <div className="stats-grid">
          <Card className="stat-card">
            <div className="stat-content">
              <div className="stat-icon primary">
                <Building2 size={28} />
              </div>
              <div>
                <div className="stat-label">Total de Validadoras</div>
                <div className="stat-value">{stats.total}</div>
              </div>
            </div>
          </Card>

          <Card className="stat-card">
            <div className="stat-content">
              <div className="stat-icon success">
                <CheckCircle size={28} />
              </div>
              <div>
                <div className="stat-label">Ativas</div>
                <div className="stat-value">{stats.ativas}</div>
              </div>
            </div>
          </Card>

          <Card className="stat-card">
            <div className="stat-content">
              <div className="stat-icon danger">
                <XCircle size={28} />
              </div>
              <div>
                <div className="stat-label">Inativas</div>
                <div className="stat-value">{stats.inativas}</div>
              </div>
            </div>
          </Card>
        </div>

        {/* Search */}
        <Card>
          <div className="search-container">
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar por nome, CNPJ ou email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
        </Card>

        {/* List */}
        <Card title="Lista de Validadoras" icon={Building2}>
          {filteredValidadoras.length === 0 ? (
            <div className="empty-state">
              <Building2 size={48} />
              <p>Nenhuma validadora encontrada</p>
              <Button variant="primary" onClick={openCreateModal}>
                Cadastrar Primeira Validadora
              </Button>
            </div>
          ) : (
            <div className="validadoras-table">
              <table>
                <thead>
                  <tr>
                    <th>Empresa</th>
                    <th>CNPJ</th>
                    <th>Email</th>
                    <th>Telefone</th>
                    <th>Responsável</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredValidadoras.map((validadora) => (
                    <tr key={validadora.id}>
                      <td><strong>{validadora.nomeempresa}</strong></td>
                      <td>{validadora.cnpj}</td>
                      <td>{validadora.email}</td>
                      <td>{validadora.telefone || '-'}</td>
                      <td>{validadora.responsavel || '-'}</td>
                      <td>
                        <span className={`badge ${validadora.ativa ? 'badge-success' : 'badge-danger'}`}>
                          {validadora.ativa ? 'Ativa' : 'Inativa'}
                        </span>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-icon btn-icon-primary"
                            onClick={() => openEditModal(validadora)}
                            title="Editar"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            className={`btn-icon ${validadora.ativa ? 'btn-icon-warning' : 'btn-icon-success'}`}
                            onClick={() => handleToggleAtiva(validadora.id)}
                            title={validadora.ativa ? 'Desativar' : 'Ativar'}
                          >
                            <Power size={16} />
                          </button>
                          <button
                            className="btn-icon btn-icon-danger"
                            onClick={() => handleDelete(validadora.id, validadora.nomeempresa)}
                            title="Excluir"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>

        {/* Modal */}
        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{modalMode === 'create' ? 'Nova Validadora' : 'Editar Validadora'}</h2>
                <button onClick={() => setShowModal(false)}>×</button>
              </div>
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-group">
                  <label>Nome da Empresa *</label>
                  <input
                    type="text"
                    name="nomeEmpresa"
                    value={formData.nomeEmpresa}
                    onChange={handleInputChange}
                    required
                    placeholder="Ex: Validadora Ambiental Ltda"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>CNPJ *</label>
                    <input
                      type="text"
                      name="cnpj"
                      value={formData.cnpj}
                      onChange={handleCNPJChange}
                      required
                      placeholder="00.000.000/0000-00"
                      maxLength="18"
                    />
                  </div>

                  <div className="form-group">
                    <label>Email *</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="contato@validadora.com"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Telefone</label>
                    <input
                      type="text"
                      name="telefone"
                      value={formData.telefone}
                      onChange={handleInputChange}
                      placeholder="(00) 0000-0000"
                    />
                  </div>

                  <div className="form-group">
                    <label>Responsável</label>
                    <input
                      type="text"
                      name="responsavel"
                      value={formData.responsavel}
                      onChange={handleInputChange}
                      placeholder="Nome do responsável"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Endereço</label>
                  <textarea
                    name="endereco"
                    value={formData.endereco}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Endereço completo da validadora"
                  />
                </div>

                <div className="form-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      name="ativa"
                      checked={formData.ativa}
                      onChange={handleInputChange}
                    />
                    <span>Validadora ativa</span>
                  </label>
                </div>

                <div className="modal-actions">
                  <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" variant="primary">
                    {modalMode === 'create' ? 'Cadastrar' : 'Atualizar'}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default GerenciarValidadoras;

