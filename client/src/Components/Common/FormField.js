import React from 'react';
import './FormField.css';

const FormField = ({ 
  label,
  required = false,
  error,
  children,
  helpText,
  className = ''
}) => {
  return (
    <div className={`form-field ${className}`}>
      {label && (
        <label className="form-label">
          {label}
          {required && <span className="form-required">*</span>}
        </label>
      )}
      {children}
      {helpText && !error && (
        <span className="form-help-text">{helpText}</span>
      )}
      {error && (
        <span className="form-error-text">{error}</span>
      )}
    </div>
  );
};

export default FormField;
