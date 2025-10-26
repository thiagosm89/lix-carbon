import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import './Header.css';

const Header = ({ toggleSidebar, sidebarOpen }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="header">
      <div className="header-left">
        <button className="menu-button" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <h1 className="header-title">
          {user?.role === 'USUARIO' && 'Área do Cliente'}
          {user?.role === 'VALIDADOR_CREDITO' && 'Painel do Validador'}
          {user?.role === 'ADMINISTRADOR' && 'Painel Administrativo'}
        </h1>
      </div>
      
      <div className="header-right">
        <div className="user-info">
          <div className="user-avatar">
            <User size={20} />
          </div>
          <div className="user-details">
            <span className="user-name">{user?.nome}</span>
            <span className="user-email">{user?.email || user?.cnpj}</span>
          </div>
        </div>
        
        <button className="logout-button" onClick={handleLogout} title="Sair">
          <LogOut size={20} />
          <span>Sair</span>
        </button>
      </div>
    </header>
  );
};

export default Header;

