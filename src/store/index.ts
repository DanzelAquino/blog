import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import authReducer from './slices/authSlice';
import blogReducer from './slices/blogSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    blogs: blogReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActionPaths: ['meta.arg', 'payload.timestamp', 'meta.requestId'],
        ignoredPaths: ['blogs.currentBlog', 'auth.user'],
      },
      immutableCheck: {
        ignoredPaths: ['blogs.currentBlog', 'auth.user'],
      },
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;