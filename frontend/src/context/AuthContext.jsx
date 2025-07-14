import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';
import { setToken, removeToken, getToken } from '../utils/cookieStorage';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check for existing token and validate it on mount
  useEffect(() => {
    const validateToken = async () => {
      const token = getToken();
      if (token) {
        try {
          const res = await api.get('/auth/validate-token');
          setUser(res.data.user);
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
      setUser(res.data.data.user);
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
