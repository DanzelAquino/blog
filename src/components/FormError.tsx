import React from 'react';

interface FormErrorProps {
  message: string;
  onDismiss?: () => void;
}

const FormError: React.FC<FormErrorProps> = ({ message, onDismiss }) => {
  const styles = {
    container: {
      padding: '16px',
      marginBottom: '16px',
      backgroundColor: '#fef2f2',
      border: '1px solid #fecaca',
      borderRadius: '8px',
    },
    content: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    message: {
      display: 'flex',
      alignItems: 'center',
      color: '#dc2626',
    },
    icon: {
      marginRight: '8px',
    },
    dismissButton: {
      background: 'none',
      border: 'none',
      color: '#dc2626',
      cursor: 'pointer',
      fontSize: '20px',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <div style={styles.message}>
          <svg
            style={styles.icon}
            width="20"
            height="20"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <p>{message}</p>
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            style={styles.dismissButton}
            aria-label="Dismiss error"
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

export default FormError;