import React from 'react';
import './Button.css';

const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'medium',
  icon: Icon,
  onClick,
  disabled = false,
  fullWidth = false,
  type = 'button',
  className = ''
}) => {
  return (
    <button
      type={type}
      className={`button button-${variant} button-${size} ${fullWidth ? 'button-full' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {Icon && <Icon size={size === 'small' ? 16 : size === 'large' ? 24 : 20} />}
      <span>{children}</span>
    </button>
  );
};

export default Button;

