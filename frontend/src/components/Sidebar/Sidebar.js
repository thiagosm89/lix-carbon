import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Trash2, 
  Wallet,
  CheckCircle,
  BarChart3,
  Package,
  Building2
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ isOpen, userRole }) => {
  const menuItems = {
    USUARIO: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/registrar-lixo', icon: Trash2, label: 'Registrar Lixo' },
      { path: '/pagamentos', icon: Wallet, label: 'Acompanhar Pagamento' }
    ],
    VALIDADOR_CREDITO: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/validar', icon: CheckCircle, label: 'Validar Créditos' },
      { path: '/relatorios', icon: BarChart3, label: 'Relatórios' }
    ],
    ADMINISTRADOR: [
      { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
      { path: '/gerenciar-lotes', icon: Package, label: 'Gerenciar Lotes' },
      { path: '/gerenciar-validadoras', icon: Building2, label: 'Validadoras' }
    ]
  };

  const items = menuItems[userRole] || menuItems.USUARIO;

  return (
    <aside className={`sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <img src="/logomarca.png" alt="LixCarbon" className="logo-icon" />
        </div>
      </div>
      
      <nav className="sidebar-nav">
        {items.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `sidebar-item ${isActive ? 'active' : ''}`
            }
            title={!isOpen ? item.label : ''}
          >
            <item.icon size={22} />
            {isOpen && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-role">
          {isOpen && (
            <span className="role-badge">
              {userRole === 'USUARIO' && 'Empresa'}
              {userRole === 'VALIDADOR_CREDITO' && 'Validador'}
              {userRole === 'ADMINISTRADOR' && 'Admin'}
            </span>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

