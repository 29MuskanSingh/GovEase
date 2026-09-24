import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { adminApi, ApiError } from '../api/adminApi';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const clearAuth = useCallback(() => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
  }, []);

  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const data = await adminApi.auth.me();
      if (data.user?.role !== 'ADMIN') {
        clearAuth();
        throw new ApiError('Access denied. Admin role required.', 403);
      }
      setUser(data.user);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        try {
          const refreshData = await adminApi.auth.refresh();
          localStorage.setItem('accessToken', refreshData.accessToken);
          const data = await adminApi.auth.me();
          if (data.user?.role !== 'ADMIN') {
            clearAuth();
            throw new ApiError('Access denied. Admin role required.', 403);
          }
          setUser(data.user);
        } catch (refreshErr) {
          clearAuth();
        }
      } else {
        clearAuth();
      }
    } finally {
      setLoading(false);
    }
  }, [clearAuth]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email, password) => {
    setError(null);
    try {
      const data = await adminApi.auth.login({ email, password });
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      
      if (data.user.role !== 'ADMIN') {
        clearAuth();
        throw new ApiError('Access denied. Admin role required.', 403);
      }
      
      setUser(data.user);
      return { user: data.user, passwordChangeRequired: data.user.passwordChangeRequired };
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Login failed. Please try again.');
      }
      throw err;
    }
  };

  const logout = async () => {
    try {
      await adminApi.auth.logout();
    } catch (err) {
      console.warn('Logout API call failed:', err);
    } finally {
      clearAuth();
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    setError(null);
    try {
      await adminApi.auth.changePassword({ currentPassword, newPassword });
      const data = await adminApi.auth.me();
      setUser(data);
      return true;
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Password change failed. Please try again.');
      }
      throw err;
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    changePassword,
    isAuthenticated: !!user,
    clearError: () => setError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}