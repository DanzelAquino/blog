import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAppDispatch } from '../store';
import { signOut } from '../store/slices/authSlice';

const Logout: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const performLogout = async () => {
      if (isAuthenticated) {
        try {
          await dispatch(signOut()).unwrap();
        } catch (err) {
          console.error('Logout failed:', err);
        }
      }
      // Redirect to home after logout
      setTimeout(() => {
        navigate('/');
      }, 1500);
    };

    performLogout();
  }, [dispatch, navigate, isAuthenticated]);

  return (
    <div className="logout-page">
      <div className="logout-container">
        <div className="logout-content">
          <div className="logout-icon">👋</div>
          <h2 className="logout-title">Signing Out...</h2>
          <p className="logout-message">
            You are being signed out of your account.
          </p>
          <div className="logout-spinner-container">
            <div className="loading-spinner logout-spinner"></div>
          </div>
          <p className="logout-redirect">You will be redirected to the homepage shortly.</p>
        </div>
      </div>
    </div>
  );
};

export default Logout;