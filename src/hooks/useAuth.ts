import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../store';
import { supabase } from '../utils/supabase';
import { setUser } from '../store/slices/authSlice';
import { AuthUser } from '../types';

export const useAuth = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, loading, error } = useAppSelector((state) => state.auth);

  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (isMounted && session?.user) {
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            created_at: session.user.created_at,
          };
          dispatch(setUser(authUser));
        } else if (isMounted) {
          dispatch(setUser(null));
        }
      } catch (err) {
        console.error('Failed to get session:', err);
        if (isMounted) {
          dispatch(setUser(null));
        }
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  useEffect(() => {
    let isMounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        if (session?.user) {
          const authUser: AuthUser = {
            id: session.user.id,
            email: session.user.email || '',
            created_at: session.user.created_at,
          };
          dispatch(setUser(authUser));
        } else {
          dispatch(setUser(null));
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [dispatch]);

  return {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    userId: user?.id,
    userEmail: user?.email,
  };
};