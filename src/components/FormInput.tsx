import React from 'react';
import { UseFormRegister, FieldError } from 'react-hook-form';

interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  register: UseFormRegister<any>;
  error?: FieldError;
  required?: boolean;
  disabled?: boolean;
}

const FormInput: React.FC<FormInputProps> = ({
  label,
  name,
  type = 'text',
  placeholder = '',
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
    input: {
      width: '100%',
      padding: '8px 12px',
      border: `1px solid ${error ? '#f87171' : '#d1d5db'}`,
      borderRadius: '6px',
      fontSize: '14px',
      backgroundColor: disabled ? '#f3f4f6' : 'white',
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
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        style={styles.input}
        {...register(name)}
      />
      {error && (
        <p style={styles.error}>{error.message}</p>
      )}
    </div>
  );
};

export default FormInput;