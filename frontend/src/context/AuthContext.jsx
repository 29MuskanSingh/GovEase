import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import * as authApi from '../api/authApi';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);
  const refreshTimer = useRef(null);

  const storeTokens = useCallback((accessToken, refreshToken) => {
    if (accessToken) {
      localStorage.setItem('token', accessToken);
      setToken(accessToken);
    }
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }, []);

  const clearSession = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    setToken(null);
    setUser(null);
  }, []);

  // Silently exchange the refresh token for a new access token.
  // Runs on mount and every 10 minutes so the access token never
  // expires while the user is working.
  const refreshAccessToken = useCallback(async () => {
    if (!localStorage.getItem('refreshToken')) return false;
    try {
      const data = await authApi.refresh();
      storeTokens(data.accessToken, null);
      return true;
    } catch (error) {
      // Refresh token is invalid/expired: end the session cleanly.
      clearSession();
      return false;
    }
  }, [storeTokens, clearSession]);

  useEffect(() => {
    const initAuth = async () => {
      if (localStorage.getItem('token')) {
        try {
          await refreshAccessToken();
          const response = await authApi.getCurrentUser();
          setUser(response.user);
        } catch (error) {
          console.error('Auth check failed:', error);
          clearSession();
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // Keep the session alive for as long as the tab is open.
  useEffect(() => {
    if (refreshTimer.current) clearInterval(refreshTimer.current);
    refreshTimer.current = setInterval(() => {
      if (localStorage.getItem('token')) {
        refreshAccessToken();
      }
    }, 10 * 60 * 1000);

    return () => {
      if (refreshTimer.current) clearInterval(refreshTimer.current);
    };
  }, [refreshAccessToken]);

  const loginUser = async (email, password) => {
    const response = await authApi.login({ email, password });
    storeTokens(response.accessToken, response.refreshToken);
    setUser(response.user);
    return response;
  };

  const registerUser = async (userData) => {
    const response = await authApi.register(userData);
    storeTokens(response.accessToken, response.refreshToken);
    setUser(response.user);
    return response;
  };

  const logoutUser = async () => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }
    clearSession();
  };

  const value = {
    user,
    token,
    loading,
    loginUser,
    registerUser,
    logoutUser,
    refreshAccessToken,
    isAuthenticated: !!localStorage.getItem('token') && !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
