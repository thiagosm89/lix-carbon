import React from 'react';
import { Users, TrendingUp, Wallet, AlertCircle, RefreshCw } from 'lucide-react';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';

const AdminDashboard = ({ data, onRefresh }) => {
  // Formatação segura de números
  const formatNumber = (value, decimals = 2) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '0.' + '0'.repeat(decimals);
    return num.toFixed(decimals);
  };

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
                {formatNumber(data.resumo.totalCredito, 2)}
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
                {formatNumber(data.resumo.valorPendente, 2)}
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
                    <td>{formatNumber(empresa.creditoTotal, 2)} CO₂</td>
                    <td>
                      <span className={empresa.creditoPendente > 0 ? 'text-warning' : ''}>
                        {formatNumber(empresa.creditoPendente, 2)} CO₂
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
    </div>
  );
};

export default AdminDashboard;

