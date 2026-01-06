import React from 'react';
import './Select.css';

const Select = ({ 
  value,
  onChange,
  options = [],
  placeholder = 'Select...',
  disabled = false,
  required = false,
  error = '',
  className = '',
  valueKey = 'value',
  labelKey = 'label',
  ...props 
}) => {
  const selectClasses = [
    'select',
    error && 'select-error',
    disabled && 'select-disabled',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className="select-wrapper">
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={selectClasses}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option, index) => {
          const optionValue = typeof option === 'object' ? option[valueKey] : option;
          const optionLabel = typeof option === 'object' ? option[labelKey] : option;
          
          return (
            <option key={index} value={optionValue}>
              {optionLabel}
            </option>
          );
        })}
      </select>
      {error && <span className="select-error-message">{error}</span>}
    </div>
  );
};

export default Select;
