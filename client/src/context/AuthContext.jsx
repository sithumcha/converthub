import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await authService.getMe();
      setUser(res.data.user);
    } catch (err) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await authService.login(email, password);

    // ✅ Save token to localStorage
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
    }

    setUser(res.data.user);
    return res.data;
  };

  const register = async (username, email, password) => {
    const res = await authService.register(username, email, password);

    // ✅ Save token to localStorage
    if (res.data.token) {
      localStorage.setItem('token', res.data.token);
    }

    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('token');
      setUser(null);
    }
  };

  const verifySession = async () => {
    await checkUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkUser, verifySession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);