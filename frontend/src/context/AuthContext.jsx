import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth } from '../services/api';
import { setToken, removeToken, getToken } from '../utils/cookieStorage';

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const roleMap = { 1: "admin", 2: "subadmin", 3: "user" };

  // Check for existing token and validate it on mount
  useEffect(() => {
    const validateToken = async () => {
      const token = getToken();
      if (token) {
        try {
          const res = await auth.getProfile();
          const userData = res.data.data;
          setUser({ ...userData, role: roleMap[userData.role_id] });
        } catch (err) {
          console.error('Token validation error:', err);
          removeToken();
          setUser(null);
        }
      }
      setLoading(false);
    };
    validateToken();
  }, []);

  const login = async (email, password) => {
    try {
      const res = await auth.login({ email, password });
      const { tokens, user: userData } = res.data.data;
      setToken(tokens.accessToken);
      setUser({ ...userData, role: roleMap[userData.role_id] });
      setError(null);
      return true;
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid credentials');
      return false;
    }
  };

  const logout = async () => {
    try {
      await auth.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      removeToken();
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, error, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
