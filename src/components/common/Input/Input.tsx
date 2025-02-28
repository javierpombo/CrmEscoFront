import React, { forwardRef } from 'react';
import styles from './Input.module.css';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
  variant?: 'standard' | 'outlined' | 'filled';
  className?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  fullWidth = false,
  variant = 'outlined',
  className = '',
  ...props
}, ref) => {
  const inputClasses = [
    styles.input,
    styles[variant],
    fullWidth ? styles.fullWidth : '',
    error ? styles.error : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <div className={styles.inputContainer}>
      {label && <label className={styles.label}>{label}</label>}
      <input
        ref={ref}
        className={inputClasses}
        {...props}
      />
      {error && <span className={styles.errorMessage}>{error}</span>}
    </div>
  );
});

Input.displayName = 'Input';