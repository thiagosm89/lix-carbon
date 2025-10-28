import React from 'react';
import './StatusBadge.css';

/**
 * Componente reutilizável para exibir status de registros de lixo
 * @param {string} status - O status a ser exibido (VALIDADO, ENVIADO_VALIDADORA, etc.)
 * @param {boolean} showIcon - Se deve exibir ícone (padrão: false)
 */
const StatusBadge = ({ status, showIcon = false }) => {
  // Mapeamento de status para labels e ícones
  const statusConfig = {
    'VALIDADO': {
      label: 'Validado',
      icon: '✓',
      className: 'status-validado'
    },
    'ENVIADO_VALIDADORA': {
      label: 'Enviado à Validadora',
      icon: '📤',
      className: 'status-enviado_validadora'
    },
    'LIBERADO_PAGAMENTO': {
      label: 'Liberado p/ Pagamento',
      icon: '✓',
      className: 'status-liberado_pagamento'
    },
    'PENDENTE_PAGAMENTO': {
      label: 'Pendente Pagamento',
      icon: '⏱',
      className: 'status-pendente_pagamento'
    },
    'PAGO': {
      label: 'Pago',
      icon: '✓',
      className: 'status-pago'
    }
  };

  const config = statusConfig[status] || {
    label: status,
    icon: '•',
    className: 'status-default'
  };

  return (
    <span className={`status-badge ${config.className}`}>
      {showIcon && <span className="status-icon">{config.icon}</span>}
      <span className="status-label">{config.label}</span>
    </span>
  );
};

export default StatusBadge;

