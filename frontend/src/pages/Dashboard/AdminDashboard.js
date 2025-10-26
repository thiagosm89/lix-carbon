import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, TrendingUp, Wallet, AlertCircle, RefreshCw } from 'lucide-react';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';

const AdminDashboard = ({ data, onRefresh }) => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Painel Administrativo</h1>
          <p>Gerencie empresas, pagamentos e parâmetros do sistema</p>
        </div>
        <Button variant="outline" icon={RefreshCw} onClick={onRefresh}>
          Atualizar
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="stats-grid">
        <Card className="stat-card stat-card-primary">
          <div className="stat-content">
            <div className="stat-icon">
              <Users size={28} />
            </div>
            <div>
              <div className="stat-label">Total de Empresas</div>
              <div className="stat-value">{data.resumo.totalEmpresas}</div>
            </div>
          </div>
        </Card>

        <Card className="stat-card stat-card-success">
          <div className="stat-content">
            <div className="stat-icon">
              <TrendingUp size={28} />
            </div>
            <div>
              <div className="stat-label">Total de Créditos</div>
              <div className="stat-value">
                {data.resumo.totalCredito.toFixed(2)}
                <span className="stat-unit">CO₂</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="stat-card stat-card-warning">
          <div className="stat-content">
            <div className="stat-icon">
              <AlertCircle size={28} />
            </div>
            <div>
              <div className="stat-label">Pagamentos Pendentes</div>
              <div className="stat-value">{data.resumo.pagamentosPendentes}</div>
            </div>
          </div>
        </Card>

        <Card className="stat-card stat-card-info">
          <div className="stat-content">
            <div className="stat-icon">
              <Wallet size={28} />
            </div>
            <div>
              <div className="stat-label">Valor Pendente</div>
              <div className="stat-value">
                {data.resumo.valorPendente.toFixed(2)}
                <span className="stat-unit">CO₂</span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Empresas */}
      <Card title="Empresas Cadastradas" icon={Users}>
        {data.empresas.length > 0 ? (
          <div className="records-table">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>CNPJ</th>
                  <th>Registros</th>
                  <th>Crédito Total</th>
                  <th>Pendente</th>
                </tr>
              </thead>
              <tbody>
                {data.empresas.map((empresa) => (
                  <tr key={empresa.id}>
                    <td>{empresa.nome}</td>
                    <td>{empresa.cnpj}</td>
                    <td>{empresa.totalRegistros}</td>
                    <td>{empresa.creditoTotal.toFixed(2)} CO₂</td>
                    <td>
                      <span className={empresa.creditoPendente > 0 ? 'text-warning' : ''}>
                        {empresa.creditoPendente.toFixed(2)} CO₂
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <Users size={48} />
            <p>Nenhuma empresa cadastrada</p>
          </div>
        )}
      </Card>

      {/* Pagamentos Pendentes */}
      <Card title="Pagamentos Aguardando Processamento" icon={Wallet}>
        {data.pagamentosPendentes && data.pagamentosPendentes.length > 0 ? (
          <div className="records-table">
            <table>
              <thead>
                <tr>
                  <th>Data Solicitação</th>
                  <th>Empresa</th>
                  <th>Categoria</th>
                  <th>Peso</th>
                  <th>Crédito</th>
                </tr>
              </thead>
              <tbody>
                {data.pagamentosPendentes.map((registro) => (
                  <tr key={registro.id}>
                    <td>
                      {new Date(registro.dataSolicitacaoPagamento || registro.dataCriacao)
                        .toLocaleDateString('pt-BR')}
                    </td>
                    <td>Empresa #{registro.userId.slice(0, 8)}</td>
                    <td>
                      <span className={`badge badge-${registro.categoria.toLowerCase()}`}>
                        {registro.categoria === 'RECICLAVEL' ? 'Reciclável' : 'Orgânico'}
                      </span>
                    </td>
                    <td>{registro.peso.toFixed(1)} kg</td>
                    <td>{registro.credito.toFixed(2)} CO₂</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <Wallet size={48} />
            <p>Nenhum pagamento pendente no momento</p>
          </div>
        )}
      </Card>

      {/* Ações Rápidas */}
      <div className="quick-actions">
        <Button 
          variant="primary" 
          size="large" 
          icon={Wallet}
          onClick={() => navigate('/pagamentos')}
        >
          Gerenciar Pagamentos
        </Button>
      </div>
    </div>
  );
};

export default AdminDashboard;

