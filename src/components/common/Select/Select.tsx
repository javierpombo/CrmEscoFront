import React, { forwardRef } from 'react';
import styles from './Select.module.css';

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  fullWidth?: boolean;
  variant?: 'standard' | 'outlined' | 'filled';
  className?: string;
  placeholder?: string; // Añade esta línea
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  label,
  options,
  error,
  fullWidth = false,
  variant = 'outlined',
  className = '',
  placeholder,
  ...props
}, ref) => {
  const selectClasses = [
    styles.select,
    styles[variant],
    fullWidth ? styles.fullWidth : '',
    error ? styles.error : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.selectContainer}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.selectWrapper}>
        <select
          ref={ref}
          className={selectClasses}
          {...props}
        >
          <option value="" disabled hidden>
            {placeholder || 'Seleccionar...'}
          </option>
          {options.map((option) => (
            <option 
              key={option.value} 
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>
        <div className={styles.selectArrow}>▼</div>
      </div>
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
});

Select.displayName = 'Select';