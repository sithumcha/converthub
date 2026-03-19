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
    try {
      const res = await authService.getMe();
      setUser(res.data.user);
    } catch (err) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const res = await authService.login(email, password);
    setUser(res.data.user);
    return res.data;
  };

  const register = async (username, email, password) => {
    const res = await authService.register(username, email, password);
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } finally {
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
