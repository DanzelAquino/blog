import React from 'react';

interface LoadingSpinnerProps {
  size?: 'small' | 'medium' | 'large';
  color?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  size = 'medium', 
  color = '#2563eb' 
}) => {
  const sizeMap = {
    small: '16px',
    medium: '32px',
    large: '48px',
  };

  const spinnerStyles = {
    container: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    },
    spinner: {
      width: sizeMap[size],
      height: sizeMap[size],
      border: `4px solid ${color}20`,
      borderTop: `4px solid ${color}`,
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
  };

  return (
    <div style={spinnerStyles.container}>
      <div style={spinnerStyles.spinner} />
    </div>
  );
};

export default LoadingSpinner;