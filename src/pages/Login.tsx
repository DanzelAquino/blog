import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAppDispatch, useAppSelector } from '../store';
import { signIn, clearError } from '../store/slices/authSlice';
import { loginSchema, LoginFormData } from '../utils/validationSchema';
import FormInput from '../components/FormInput';
import FormErrorMessage from '../components/FormError';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { loading, error } = useAppSelector((state) => state.auth);
  const { isAuthenticated } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<LoginFormData>({
    resolver: yupResolver(loginSchema),
    mode: 'onBlur',
    defaultValues: {
      email: '',
      password: '',
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      await dispatch(signIn(data)).unwrap();
      reset();
    } catch (err) {
      console.error('Login failed:', err);
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
    rememberRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
    },
    checkboxLabel: {
      display: 'flex',
      alignItems: 'center',
      fontSize: '14px',
      color: '#374151',
    },
    checkbox: {
      marginRight: '8px',
    },
    forgotPassword: {
      fontSize: '14px',
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
          <h1 style={styles.title}>Sign in</h1>
          <p style={styles.subtitle}>
            Or{' '}
            <Link
              to="/register"
              style={styles.link}
              onClick={handleClearError}
            >
              create a new account
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

            <div style={styles.rememberRow}>
              <label style={styles.checkboxLabel}>
                <input type="checkbox" style={styles.checkbox} />
                Remember me
              </label>
              <a href="#" style={styles.forgotPassword}>
                Forgot password?
              </a>
            </div>

            <button
              type="submit"
              disabled={isSubmitting || loading}
              className="btn btn-primary"
              style={styles.submitButton}
            >
              {isSubmitting || loading ? 'Signing in...' : 'Sign in'}
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

export default Login;