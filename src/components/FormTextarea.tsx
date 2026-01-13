import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';

interface FormTextareaProps {
  label: string;
  name: string;
  placeholder?: string;
  rows?: number;
  register: UseFormRegister<any>;
  error?: FieldError;
  required?: boolean;
  disabled?: boolean;
}

const FormTextarea: React.FC<FormTextareaProps> = ({
  label,
  name,
  placeholder = '',
  rows = 4,
  register,
  error,
  required = false,
  disabled = false,
}) => {
  const styles = {
    container: {
      marginBottom: '16px',
    },
    label: {
      display: 'block',
      marginBottom: '8px',
      fontWeight: '500',
      color: '#374151',
    },
    required: {
      color: '#dc2626',
    },
    textarea: {
      width: '100%',
      padding: '8px 12px',
      border: `1px solid ${error ? '#f87171' : '#d1d5db'}`,
      borderRadius: '6px',
      fontSize: '14px',
      backgroundColor: disabled ? '#f3f4f6' : 'white',
      resize: 'vertical' as 'vertical',
    },
    error: {
      color: '#dc2626',
      fontSize: '14px',
      marginTop: '4px',
    },
  };

  return (
    <div style={styles.container}>
      <label htmlFor={name} style={styles.label}>
        {label} {required && <span style={styles.required}>*</span>}
      </label>
      <textarea
        id={name}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        style={styles.textarea}
        {...register(name)}
      />
      {error && (
        <p style={styles.error}>{error.message}</p>
      )}
    </div>
  );
};

export default FormTextarea;