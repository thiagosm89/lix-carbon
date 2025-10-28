import React from 'react';
import './CategoryBadge.css';

/**
 * Componente reutilizável para exibir categorias de lixo
 * @param {string} categoria - A categoria (RECICLAVEL ou ORGANICO)
 * @param {boolean} showIcon - Se deve exibir ícone (padrão: true)
 */
const CategoryBadge = ({ categoria, showIcon = true }) => {
  // Mapeamento de categorias
  const categoryConfig = {
    'RECICLAVEL': {
      label: 'Reciclável',
      icon: '♻️',
      className: 'category-reciclavel'
    },
    'ORGANICO': {
      label: 'Orgânico',
      icon: '🌿',
      className: 'category-organico'
    }
  };

  const config = categoryConfig[categoria] || {
    label: categoria,
    icon: '📦',
    className: 'category-default'
  };

  return (
    <span className={`category-badge ${config.className}`}>
      {showIcon && <span className="category-icon">{config.icon}</span>}
      <span className="category-label">{config.label}</span>
    </span>
  );
};

export default CategoryBadge;

