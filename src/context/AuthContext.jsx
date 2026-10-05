// src/context/AuthContext.jsx
import { createContext, useState, useCallback } from 'react';
import {
  getAuthToken,
  removeAuthToken,
  getUserData,
  setUserData as saveUserData,
} from '../services/api/authApi';

// ✅ AuthContext را export می‌کنیم (نه default)
export const AuthContext = createContext(null);

// ============================================================
// تابع اولیه‌سازی state از localStorage
// ============================================================
const getInitialAuthState = () => {
  try {
    const token = getAuthToken();
    const userData = getUserData();
    return {
      isAuthenticated: !!token,
      user: userData || null,
      role: userData?.role || 'dehyar',
    };
  } catch (error) {
    console.warn('Failed to read auth state:', error);
    return {
      isAuthenticated: false,
      user: null,
      role: 'dehyar',
    };
  }
};

export const AuthProvider = ({ children }) => {
  const [authState, setAuthState] = useState(getInitialAuthState);

  const login = useCallback((userData) => {
    if (userData) {
      saveUserData(userData);
    }
    setAuthState({
      isAuthenticated: true,
      user: userData || null,
      role: userData?.role || 'dehyar',
    });
  }, []);

  const logout = useCallback(() => {
    removeAuthToken();
    setAuthState({
      isAuthenticated: false,
      user: null,
      role: 'dehyar',
    });
  }, []);

  const checkAuth = useCallback(() => {
    const newState = getInitialAuthState();
    setAuthState(newState);
    return newState.isAuthenticated;
  }, []);

  // ✅ برای بعد از تغییر role از پنل کاربران
  const refreshRole = useCallback(() => {
    const userData = getUserData();
    setAuthState((prev) => ({
      ...prev,
      user: userData || prev.user,
      role: userData?.role || prev.role,
    }));
  }, []);

  const value = {
    isAuthenticated: authState.isAuthenticated,
    user: authState.user,
    role: authState.role,
    loading: false,
    login,
    logout,
    checkAuth,
    refreshRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};