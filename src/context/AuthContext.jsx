import React, { createContext, useContext, useEffect, useState } from 'react';
import api from '../api';
const C = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const t = localStorage.getItem('spotlyn_token');
    if (!t) {
      setLoading(false);
      return;
    }
    api
      .get('/auth/me')
      .then((r) => setUser(r.data.user))
      .catch(() => localStorage.removeItem('spotlyn_token'))
      .finally(() => setLoading(false));
  }, []);
  const login = async (identifier, password) => {
    const r = await api.post('/auth/login', { identifier, password });
    localStorage.setItem('spotlyn_token', r.data.token);
    setUser(r.data.user);
    return r.data.user;
  };
  const register = async (data) => {
    const r = await api.post('/auth/register', data);
    localStorage.setItem('spotlyn_token', r.data.token);
    setUser(r.data.user);
    return r.data.user;
  };
  const logout = () => {
    localStorage.removeItem('spotlyn_token');
    setUser(null);
  };
  return (
    <C.Provider value={{ user, loading, isAuthenticated: !!user, login, register, logout }}>
      {children}
    </C.Provider>
  );
}
export const useAuth = () => useContext(C);
