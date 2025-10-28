import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Páginas
import LandingPage from './pages/LandingPage/LandingPage';
import Login from './pages/Login/Login';
import Cadastro from './pages/Cadastro/Cadastro';
import Dashboard from './pages/Dashboard/Dashboard';
import RegistroLixo from './pages/RegistroLixo/RegistroLixo';
import AcompanharPagamento from './pages/AcompanharPagamento/AcompanharPagamento';
import GerenciarPagamentos from './pages/GerenciarPagamentos/GerenciarPagamentos';
import GerenciarLotes from './pages/GerenciarLotes/GerenciarLotes';
import GerenciarValidadoras from './pages/GerenciarValidadoras/GerenciarValidadoras';
import TotemSimulador from './pages/TotemSimulador/TotemSimulador';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />
          <Route path="/totem" element={<TotemSimulador />} />
          
          {/* Rotas protegidas */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/registrar-lixo"
            element={
              <ProtectedRoute roles={['USUARIO']}>
                <RegistroLixo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/pagamentos"
            element={
              <ProtectedRoute roles={['USUARIO']}>
                <AcompanharPagamento />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gerenciar-pagamentos"
            element={
              <ProtectedRoute roles={['ADMINISTRADOR']}>
                <GerenciarPagamentos />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gerenciar-lotes"
            element={
              <ProtectedRoute roles={['ADMINISTRADOR']}>
                <GerenciarLotes />
              </ProtectedRoute>
            }
          />
          <Route
            path="/gerenciar-validadoras"
            element={
              <ProtectedRoute roles={['ADMINISTRADOR']}>
                <GerenciarValidadoras />
              </ProtectedRoute>
            }
          />
          
          {/* Rota padrão */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

