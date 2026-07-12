import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { authService } from '../services';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const hasInitialized = useRef(false);

  const initSession = useCallback(async () => {
    try {
      const { data } = await authService.getMe();
      setUser(data.data);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (hasInitialized.current) return;
    hasInitialized.current = true;
    initSession();
  }, [initSession]);

  const login = async (credentials) => {
    const { data } = await authService.login(credentials);
    window.__accessToken__ = data.data.accessToken;
    setUser(data.data.user);
    return data.data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
      window.__accessToken__ = null;
      setUser(null);
    }
  };

  const updateUser = (updatedFields) => {
    setUser((prev) => (prev ? { ...prev, ...updatedFields } : prev));
  };

  const value = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
