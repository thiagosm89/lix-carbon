import React from 'react';
import './Card.css';

const Card = ({ 
  children, 
  title, 
  subtitle, 
  icon: Icon, 
  className = '',
  hover = false 
}) => {
  return (
    <div className={`card ${hover ? 'card-hover' : ''} ${className}`}>
      {(title || Icon) && (
        <div className="card-header">
          {Icon && (
            <div className="card-icon">
              <Icon size={24} />
            </div>
          )}
          <div>
            {title && <h3 className="card-title">{title}</h3>}
            {subtitle && <p className="card-subtitle">{subtitle}</p>}
          </div>
        </div>
      )}
      <div className="card-body">
        {children}
      </div>
    </div>
  );
};

export default Card;

