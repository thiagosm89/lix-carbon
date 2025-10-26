import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Layout from '../../components/Layout/Layout';
import api from '../../services/api';
import UsuarioDashboard from './UsuarioDashboard';
import ValidadorDashboard from './ValidadorDashboard';
import AdminDashboard from './AdminDashboard';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, [user]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      let endpoint = '';
      
      if (user.role === 'USUARIO') {
        endpoint = '/dashboard/usuario';
      } else if (user.role === 'VALIDADOR_CREDITO') {
        endpoint = '/dashboard/validador';
      } else if (user.role === 'ADMINISTRADOR') {
        endpoint = '/dashboard/admin';
      }

      const response = await api.get(endpoint);
      setDashboardData(response.data);
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderDashboard = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Carregando dados...</p>
        </div>
      );
    }

    if (!dashboardData) {
      return (
        <div className="error-container">
          <p>Erro ao carregar dados do dashboard</p>
        </div>
      );
    }

    switch (user.role) {
      case 'USUARIO':
        return <UsuarioDashboard data={dashboardData} onRefresh={loadDashboardData} />;
      case 'VALIDADOR_CREDITO':
        return <ValidadorDashboard data={dashboardData} onRefresh={loadDashboardData} />;
      case 'ADMINISTRADOR':
        return <AdminDashboard data={dashboardData} onRefresh={loadDashboardData} />;
      default:
        return <div>Perfil não reconhecido</div>;
    }
  };

  return (
    <Layout>
      {renderDashboard()}
    </Layout>
  );
};

export default Dashboard;

