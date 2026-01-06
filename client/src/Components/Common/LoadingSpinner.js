import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ 
  size = 'medium',
  color = 'primary',
  text = '',
  centered = false,
  className = ''
}) => {
  const spinnerClasses = [
    'loading-spinner',
    `spinner-${size}`,
    `spinner-${color}`,
    className
  ].filter(Boolean).join(' ');

  const wrapperClasses = [
    'loading-spinner-wrapper',
    centered && 'spinner-centered'
  ].filter(Boolean).join(' ');

  return (
    <div className={wrapperClasses}>
      <div className={spinnerClasses}></div>
      {text && <p className="spinner-text">{text}</p>}
    </div>
  );
};

export default LoadingSpinner;
