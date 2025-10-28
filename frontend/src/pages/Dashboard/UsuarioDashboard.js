import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  TrendingUp, 
  Trash2,
  Leaf, 
  Recycle,
  Calendar,
  RefreshCw
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import Card from '../../components/Card/Card';
import Button from '../../components/Button/Button';
import StatusBadge from '../../components/StatusBadge/StatusBadge';
import CategoryBadge from '../../components/CategoryBadge/CategoryBadge';

const UsuarioDashboard = ({ data, onRefresh }) => {
  const navigate = useNavigate();

  // Formatação segura de números - NUNCA quebra!
  const formatNumber = (value, decimals = 1) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '0.' + '0'.repeat(decimals);
    return num.toFixed(decimals);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Acompanhe suas coletas e registros de resíduos</p>
        </div>
        <Button variant="outline" icon={RefreshCw} onClick={onRefresh}>
          Atualizar
        </Button>
      </div>

      {/* Cards de Resumo */}
      <div className="stats-grid">
        <Card className="stat-card stat-card-success">
          <div className="stat-content">
            <div className="stat-icon">
              <Trash2 size={28} />
            </div>
            <div>
              <div className="stat-label">Peso Total Coletado</div>
              <div className="stat-value">
                {formatNumber(data.resumo.totalPeso)}
                <span className="stat-unit">kg</span>
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
              <div className="stat-label">Total de Registros</div>
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
                    {formatNumber(data.porCategoria.RECICLAVEL.peso)} kg
                  </span>
                </div>
                <div className="category-stat">
                  <span className="stat-label-small">Quantidade</span>
                  <span className="stat-value-small">
                    {data.porCategoria.RECICLAVEL.quantidade} registro{data.porCategoria.RECICLAVEL.quantidade !== 1 ? 's' : ''}
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
                    {formatNumber(data.porCategoria.ORGANICO.peso)} kg
                  </span>
                </div>
                <div className="category-stat">
                  <span className="stat-label-small">Quantidade</span>
                  <span className="stat-value-small">
                    {data.porCategoria.ORGANICO.quantidade} registro{data.porCategoria.ORGANICO.quantidade !== 1 ? 's' : ''}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Gráfico Mensal */}
        <Card title="Evolução Mensal" icon={TrendingUp}>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data.graficoMensal || []}>
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
        {data.ultimosRegistros && data.ultimosRegistros.length > 0 ? (
          <div className="records-table">
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
                {data.ultimosRegistros.map((registro) => (
                  <tr key={registro.id}>
                    <td>{new Date(registro.dataCriacao).toLocaleString('pt-BR')}</td>
                    <td><span className="token-badge">{registro.token}</span></td>
                    <td>
                      <CategoryBadge categoria={registro.categoria} />
                    </td>
                    <td>{formatNumber(registro.peso)} kg</td>
                    <td>
                      <StatusBadge status={registro.status} />
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
    </div>
  );
};

export default UsuarioDashboard;

