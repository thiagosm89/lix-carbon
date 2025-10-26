import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Trash2, 
  Wallet, 
  Leaf, 
  Recycle,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';

const UsuarioDashboard = ({ data, onRefresh }) => {
  const navigate = useNavigate();

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Acompanhe suas contribuições e créditos de carbono</p>
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
              <Leaf size={28} />
            </div>
            <div>
              <div className="stat-label">Créditos Totais</div>
              <div className="stat-value">
                {data.resumo.totalCredito.toFixed(2)}
                <span className="stat-unit">CO₂</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="stat-card stat-card-success">
          <div className="stat-content">
            <div className="stat-icon">
              <Trash2 size={28} />
            </div>
            <div>
              <div className="stat-label">Peso Total</div>
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
              <Wallet size={28} />
            </div>
            <div>
              <div className="stat-label">Crédito Pendente</div>
              <div className="stat-value">
                {data.resumo.creditoPendente.toFixed(2)}
                <span className="stat-unit">CO₂</span>
              </div>
            </div>
          </div>
        </Card>

        <Card className="stat-card stat-card-info">
          <div className="stat-content">
            <div className="stat-icon">
              <Calendar size={28} />
            </div>
            <div>
              <div className="stat-label">Registros</div>
              <div className="stat-value">
                {data.resumo.totalRegistros}
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Contribuição por Categoria */}
      <div className="dashboard-grid">
        <Card title="Contribuição por Categoria" icon={Recycle} className="category-card">
          <div className="categories">
            <div className="category-item">
              <div className="category-header">
                <div className="category-info">
                  <Recycle className="category-icon icon-recyclable" size={24} />
                  <span className="category-name">Recicláveis</span>
                </div>
                <span className="category-percentage">
                  {data.porCategoria.RECICLAVEL.percentual}%
                </span>
              </div>
              <div className="category-progress">
                <div 
                  className="progress-bar progress-recyclable"
                  style={{ width: `${data.porCategoria.RECICLAVEL.percentual}%` }}
                ></div>
              </div>
              <div className="category-stats">
                <div className="category-stat">
                  <span className="stat-label-small">Peso</span>
                  <span className="stat-value-small">
                    {data.porCategoria.RECICLAVEL.peso.toFixed(1)} kg
                  </span>
                </div>
                <div className="category-stat">
                  <span className="stat-label-small">Créditos</span>
                  <span className="stat-value-small">
                    {data.porCategoria.RECICLAVEL.credito.toFixed(2)} CO₂
                  </span>
                </div>
              </div>
            </div>

            <div className="category-item">
              <div className="category-header">
                <div className="category-info">
                  <Leaf className="category-icon icon-organic" size={24} />
                  <span className="category-name">Orgânicos</span>
                </div>
                <span className="category-percentage">
                  {data.porCategoria.ORGANICO.percentual}%
                </span>
              </div>
              <div className="category-progress">
                <div 
                  className="progress-bar progress-organic"
                  style={{ width: `${data.porCategoria.ORGANICO.percentual}%` }}
                ></div>
              </div>
              <div className="category-stats">
                <div className="category-stat">
                  <span className="stat-label-small">Peso</span>
                  <span className="stat-value-small">
                    {data.porCategoria.ORGANICO.peso.toFixed(1)} kg
                  </span>
                </div>
                <div className="category-stat">
                  <span className="stat-label-small">Créditos</span>
                  <span className="stat-value-small">
                    {data.porCategoria.ORGANICO.credito.toFixed(2)} CO₂
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Gráfico Mensal */}
        <Card title="Evolução Mensal" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.graficoMensal}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="reciclavel" fill="#4ADE80" name="Recicláveis (kg)" />
              <Bar dataKey="organico" fill="#7FD14B" name="Orgânicos (kg)" />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Últimos Registros */}
      <Card title="Últimos Registros" icon={Trash2}>
        {data.ultimosRegistros.length > 0 ? (
          <div className="records-table">
            <table>
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Categoria</th>
                  <th>Peso</th>
                  <th>Crédito</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {data.ultimosRegistros.map((registro) => (
                  <tr key={registro.id}>
                    <td>{new Date(registro.dataCriacao).toLocaleDateString('pt-BR')}</td>
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
            <Trash2 size={48} />
            <p>Nenhum registro encontrado</p>
            <Button 
              variant="primary" 
              onClick={() => navigate('/registrar-lixo')}
            >
              Registrar Primeiro Lixo
            </Button>
          </div>
        )}
      </Card>

      {/* Ações Rápidas */}
      <div className="quick-actions">
        <Button 
          variant="primary" 
          size="large" 
          icon={Trash2}
          onClick={() => navigate('/registrar-lixo')}
        >
          Registrar Novo Lixo
        </Button>
        <Button 
          variant="secondary" 
          size="large" 
          icon={Wallet}
          onClick={() => navigate('/pagamentos')}
        >
          Solicitar Pagamento
        </Button>
      </div>
    </div>
  );
};

export default UsuarioDashboard;

