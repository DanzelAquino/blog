import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { supabase } from '../../utils/supabase';
import { 
  AuthState, 
  AuthUser, 
  SignUpCredentials, 
  SignInCredentials,
  SupabaseUser 
} from '../../types';

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

// Helper function to convert Supabase user to our AuthUser type
const convertToAuthUser = (supabaseUser: SupabaseUser | null): AuthUser | null => {
  if (!supabaseUser || !supabaseUser.id) {
    return null;
  }

  return {
    id: supabaseUser.id,
    email: supabaseUser.email || 'no-email@example.com',
    created_at: supabaseUser.created_at,
  };
};

// Async thunks
export const signUp = createAsyncThunk(
  'auth/signUp',
  async (credentials: SignUpCredentials): Promise<AuthUser | null> => {
    const { data, error } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return convertToAuthUser(data.user);
  }
);

export const signIn = createAsyncThunk(
  'auth/signIn',
  async (credentials: SignInCredentials): Promise<AuthUser | null> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: credentials.email,
      password: credentials.password,
    });
    
    if (error) {
      throw new Error(error.message);
    }
    
    return convertToAuthUser(data.user);
  }
);

export const signOut = createAsyncThunk(
  'auth/signOut',
  async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw new Error(error.message);
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetAuth: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Sign Up
    builder.addCase(signUp.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signUp.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
    });
    builder.addCase(signUp.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Sign up failed';
    });

    // Sign In
    builder.addCase(signIn.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signIn.fulfilled, (state, action) => {
      state.loading = false;
      state.user = action.payload;
    });
    builder.addCase(signIn.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Sign in failed';
    });

    // Sign Out
    builder.addCase(signOut.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(signOut.fulfilled, (state) => {
      state.loading = false;
      state.user = null;
    });
    builder.addCase(signOut.rejected, (state, action) => {
      state.loading = false;
      state.error = action.error.message || 'Sign out failed';
    });
  },
});

export const { setUser, clearError, resetAuth } = authSlice.actions;
export default authSlice.reducer;