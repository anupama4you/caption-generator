import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../store/store';
import { setUser, logout as logoutAction, setLoading } from '../store/authSlice';
import api from '../services/api';
import { User, AuthResponse } from '../types';

interface UseAuthReturn {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  googleLogin: (credential: string) => Promise<{ success: boolean; error?: string }>;
  facebookLogin: (accessToken: string) => Promise<{ success: boolean; error?: string }>;
}

/**
 * Custom hook for authentication state and actions
 */
export function useAuth(): UseAuthReturn {
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated, loading } = useSelector(
    (state: RootState) => state.auth
  );

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response = await api.post<AuthResponse>('/auth/login', {
          email,
          password,
        });

        const { user, accessToken, refreshToken } = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        dispatch(setUser(user));

        return { success: true };
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Login failed';
        return { success: false, error: errorMessage };
      }
    },
    [dispatch]
  );

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      try {
        const response = await api.post<AuthResponse>('/auth/register', {
          name,
          email,
          password,
        });

        const { user, accessToken, refreshToken } = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        dispatch(setUser(user));

        return { success: true };
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Registration failed';
        return { success: false, error: errorMessage };
      }
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    dispatch(logoutAction());
  }, [dispatch]);

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('accessToken');

    if (!token) {
      dispatch(setLoading(false));
      return;
    }

    try {
      const response = await api.get<{ data: User }>('/auth/me');
      dispatch(setUser(response.data.data));
    } catch (error) {
      // Token is invalid, clear it
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const googleLogin = useCallback(
    async (credential: string) => {
      try {
        const response = await api.post<AuthResponse>('/oauth/google', {
          credential,
        });

        const { user, accessToken, refreshToken } = response.data;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);

        dispatch(setUser(user));

        return { success: true };
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Google login failed';
        return { success: false, error: errorMessage };
      }
    },
    [dispatch]
  );

  const facebookLogin = useCallback(
    async (accessToken: string) => {
      try {
        const response = await api.post<AuthResponse>('/oauth/facebook', {
          accessToken,
        });

        const { user, accessToken: token, refreshToken } = response.data;

        localStorage.setItem('accessToken', token);
        localStorage.setItem('refreshToken', refreshToken);

        dispatch(setUser(user));

        return { success: true };
      } catch (error: any) {
        const errorMessage =
          error.response?.data?.error ||
          error.response?.data?.message ||
          'Facebook login failed';
        return { success: false, error: errorMessage };
      }
    },
    [dispatch]
  );

  return {
    user,
    isAuthenticated,
    loading,
    login,
    register,
    logout,
    checkAuth,
    googleLogin,
    facebookLogin,
  };
}

export default useAuth;
