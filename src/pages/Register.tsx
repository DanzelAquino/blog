import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAppDispatch, useAppSelector } from '../store';
import { signUp, clearError } from '../store/slices/authSlice';
import { registerSchema, RegisterFormData } from '../utils/validationSchema';
import FormInput from '../components/FormInput';
import FormErrorMessage from '../components/FormErrorMessage';

interface RegisterFormProps {
  email: string;
  password: string;
  confirmPassword: string;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const { isAuthenticated } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    watch,
  } = useForm<RegisterFormProps>({
    resolver: yupResolver(registerSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const password = watch('password');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: RegisterFormProps) => {
    try {
      await dispatch(signUp({ 
        email: data.email, 
        password: data.password 
      })).unwrap();
      
      navigate('/login', {
        state: { 
          message: 'Registration successful! Please sign in with your credentials.',
          email: data.email
        }
      });
      reset();
    } catch (err) {
      console.error('Registration failed:', err);
    }
  };

  const handleClearError = () => {
    dispatch(clearError());
  };

  const styles = {
    page: {
      minHeight: 'calc(100vh - 200px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
    },
    container: {
      maxWidth: '400px',
      width: '100%',
    },
    card: {
      backgroundColor: 'white',
      borderRadius: '12px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      padding: '32px',
    },
    title: {
      textAlign: 'center' as 'center',
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#111827',
      marginBottom: '8px',
    },
    subtitle: {
      textAlign: 'center' as 'center',
      fontSize: '14px',
      color: '#6b7280',
      marginBottom: '24px',
    },
    link: {
      color: '#2563eb',
      textDecoration: 'none',
    },
    form: {
      marginBottom: '24px',
    },
    passwordRules: {
      fontSize: '12px',
      color: '#6b7280',
      marginBottom: '16px',
    },
    passwordList: {
      marginLeft: '20px',
      marginTop: '8px',
    },
    ruleValid: {
      color: '#10b981',
    },
    ruleInvalid: {
      color: '#6b7280',
    },
    termsRow: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '24px',
      fontSize: '14px',
      color: '#374151',
    },
    checkbox: {
      marginRight: '8px',
    },
    termsLink: {
      color: '#2563eb',
      textDecoration: 'none',
    },
    submitButton: {
      width: '100%',
      padding: '12px',
      fontSize: '16px',
      fontWeight: '500',
    },
    backLink: {
      display: 'block',
      textAlign: 'center' as 'center',
      marginTop: '24px',
      color: '#2563eb',
      textDecoration: 'none',
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.card}>
          <h1 style={styles.title}>Create account</h1>
          <p style={styles.subtitle}>
            Or{' '}
            <Link
              to="/login"
              style={styles.link}
              onClick={handleClearError}
            >
              sign in to existing account
            </Link>
          </p>

          {error && (
            <FormErrorMessage 
              message={error} 
              onDismiss={handleClearError} 
            />
          )}

          <form style={styles.form} onSubmit={handleSubmit(onSubmit)}>
            <FormInput
              label="Email address"
              name="email"
              type="email"
              placeholder="you@example.com"
              register={register}
              error={errors.email}
              required
            />

            <FormInput
              label="Password"
              name="password"
              type="password"
              placeholder="••••••••"
              register={register}
              error={errors.password}
              required
            />

            <div style={styles.passwordRules}>
              <p>Password must contain:</p>
              <ul style={styles.passwordList}>
                <li style={password?.length >= 6 ? styles.ruleValid : styles.ruleInvalid}>
                  At least 6 characters
                </li>
                <li style={/[a-z]/.test(password || '') ? styles.ruleValid : styles.ruleInvalid}>
                  One lowercase letter
                </li>
                <li style={/[A-Z]/.test(password || '') ? styles.ruleValid : styles.ruleInvalid}>
                  One uppercase letter
                </li>
                <li style={/\d/.test(password || '') ? styles.ruleValid : styles.ruleInvalid}>
                  One number
                </li>
              </ul>
            </div>

            <FormInput
              label="Confirm Password"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              register={register}
              error={errors.confirmPassword}
              required
            />

            <div style={styles.termsRow}>
              <input
                type="checkbox"
                style={styles.checkbox}
                required
              />
              <label>
                I agree to the{' '}
                <a href="#" style={styles.termsLink}>Terms of Service</a>{' '}
                and{' '}
                <a href="#" style={styles.termsLink}>Privacy Policy</a>
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="btn btn-primary"
              style={styles.submitButton}
            >
              {isSubmitting || loading ? 'Creating account...' : 'Create Account'}
            </button>
          </form>

          <Link to="/" style={styles.backLink}>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Register;