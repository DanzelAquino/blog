import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAppDispatch } from '../store';
import { signOut } from '../store/slices/authSlice';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated, userEmail, loading } = useAuth();

  const handleLogout = async () => {
    try {
      await dispatch(signOut()).unwrap();
      navigate('/');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const headerStyles = {
    header: {
      backgroundColor: 'white',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      padding: '16px 0',
    },
    nav: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px',
    },
    logo: {
      fontSize: '24px',
      fontWeight: 'bold',
      color: '#2563eb',
      textDecoration: 'none',
    },
    navLinks: {
      display: 'flex',
      gap: '24px',
      alignItems: 'center',
    },
    navLink: {
      color: '#4b5563',
      textDecoration: 'none',
      fontSize: '16px',
    },
    emailText: {
      color: '#6b7280',
      fontSize: '14px',
      marginRight: '8px',
    },
    authButtons: {
      display: 'flex',
      gap: '12px',
    },
  };

  if (loading) {
    return (
      <header style={headerStyles.header}>
        <div style={headerStyles.nav}>
          <Link to="/" style={headerStyles.logo}>Simple Blog</Link>
          <div>Loading...</div>
        </div>
      </header>
    );
  }

  return (
    <header style={headerStyles.header}>
      <nav style={headerStyles.nav}>
        <Link to="/" style={headerStyles.logo}>Blogs</Link>
        
        <div style={headerStyles.navLinks}>
          <Link to="/" style={headerStyles.navLink}>Home</Link>
          <Link to="/blogs" style={headerStyles.navLink}>Blogs</Link>
          
          {isAuthenticated ? (
            <>
              <Link to="/create" style={headerStyles.navLink}>Create</Link>
              <span style={headerStyles.emailText}>{userEmail}</span>
              <button 
                onClick={handleLogout}
                className="btn btn-danger"
                style={{ padding: '8px 16px' }}
              >
                Logout
              </button>
            </>
          ) : (
            <div style={headerStyles.authButtons}>
              <Link to="/login" className="btn btn-secondary">Login</Link>
              <Link to="/register" className="btn btn-primary">Register</Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
};

export default Header;