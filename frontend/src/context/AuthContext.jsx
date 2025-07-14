import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';
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
          const res = await api.get('/auth/validate-token');
          const user = res.data.user;
          setUser({ ...user, role: roleMap[user.role_id] });
        } catch (err) {
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
      const res = await api.post('/auth/login', { email, password });
      setToken(res.data.data.tokens.accessToken);
      const user = res.data.data.user;
      setUser({ ...user, role: roleMap[user.role_id] });
      setError(null);
      return true;
    } catch (err) {
      setError('Invalid credentials');
      return false;
    }
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
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
