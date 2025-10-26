import React from 'react';
import { CheckCircle, TrendingUp, Users, Leaf, Recycle, RefreshCw } from 'lucide-react';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';

const ValidadorDashboard = ({ data, onRefresh }) => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Painel do Validador</h1>
          <p>Gerencie e valide créditos de carbono</p>
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
              <CheckCircle size={28} />
            </div>
            <div>
              <div className="stat-label">Total de Registros</div>
              <div className="stat-value">{data.resumo.totalRegistros}</div>
            </div>
          </div>
        </Card>

        <Card className="stat-card stat-card-success">
          <div className="stat-content">
            <div className="stat-icon">
              <TrendingUp size={28} />
            </div>
            <div>
              <div className="stat-label">Total de Peso</div>
              <div className="stat-value">
                {data.resumo.totalPeso.toFixed(1)}
                <span className="stat-unit">kg</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="stat-card stat-card-warning">
          <div className="stat-content">
            <div className="stat-icon">
              <Leaf size={28} />
            </div>
            <div>
              <div className="stat-label">Créditos Gerados</div>
              <div className="stat-value">
                {data.resumo.totalCredito.toFixed(2)}
                <span className="stat-unit">CO₂</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="stat-card stat-card-info">
          <div className="stat-content">
            <div className="stat-icon">
              <Users size={28} />
            </div>
            <div>
              <div className="stat-label">Empresas Ativas</div>
              <div className="stat-value">{data.resumo.empresasAtivas}</div>
            </div>
          </div>
        </Card>
      </div>

      {/* Por Categoria */}
      <div className="dashboard-grid">
        <Card title="Distribuição por Categoria" icon={Recycle}>
          <div className="distribution-grid">
            <div className="distribution-item">
              <Recycle className="distribution-icon icon-recyclable" size={32} />
              <div className="distribution-info">
                <div className="distribution-label">Recicláveis</div>
                <div className="distribution-value">
                  {data.porCategoria.RECICLAVEL.peso.toFixed(1)} kg
                </div>
                <div className="distribution-credit">
                  {data.porCategoria.RECICLAVEL.credito.toFixed(2)} CO₂
                </div>
              </div>
            </div>

            <div className="distribution-item">
              <Leaf className="distribution-icon icon-organic" size={32} />
              <div className="distribution-info">
                <div className="distribution-label">Orgânicos</div>
                <div className="distribution-value">
                  {data.porCategoria.ORGANICO.peso.toFixed(1)} kg
                </div>
                <div className="distribution-credit">
                  {data.porCategoria.ORGANICO.credito.toFixed(2)} CO₂
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Registros Recentes */}
      <Card title="Registros Recentes" icon={CheckCircle}>
        {data.registrosRecentes.length > 0 ? (
          <div className="records-table">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Empresa</th>
                  <th>Categoria</th>
                  <th>Peso</th>
                  <th>Crédito</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.registrosRecentes.map((registro) => (
                  <tr key={registro.id}>
                    <td>{new Date(registro.dataCriacao).toLocaleDateString('pt-BR')}</td>
                    <td>Empresa #{registro.userId.slice(0, 8)}</td>
                    <td>
                      <span className={`badge badge-${registro.categoria.toLowerCase()}`}>
                        {registro.categoria === 'RECICLAVEL' ? 'Reciclável' : 'Orgânico'}
                      </span>
                    </td>
                    <td>{registro.peso.toFixed(1)} kg</td>
                    <td>{registro.credito.toFixed(2)} CO₂</td>
                    <td>
                      <span className={`status status-${registro.status.toLowerCase()}`}>
                        {registro.status === 'VALIDADO' && 'Validado'}
                        {registro.status === 'PENDENTE_PAGAMENTO' && 'Pend. Pagamento'}
                        {registro.status === 'PAGO' && 'Pago'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            <CheckCircle size={48} />
            <p>Nenhum registro encontrado</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ValidadorDashboard;

