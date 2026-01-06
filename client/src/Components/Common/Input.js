import React from 'react';
import './Input.css';

const Input = ({ 
  type = 'text',
  value,
  onChange,
  placeholder,
  disabled = false,
  required = false,
  error = '',
  className = '',
  ...props 
}) => {
  const inputClasses = [
    'input',
    error && 'input-error',
    disabled && 'input-disabled',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="input-wrapper">
      <input
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        className={inputClasses}
        {...props}
      />
      {error && <span className="input-error-message">{error}</span>}
    </div>
  );
};

export default Input;
