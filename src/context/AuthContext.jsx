import { createContext, useContext, useEffect, useState } from 'react';
import { login, logout, isAuthenticated, getUserResponseFromLocalStorage } from '../utils/User';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      if (isAuthenticated()) {
        const userData = getUserResponseFromLocalStorage();
        setUser(userData);
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  const signIn = async (phoneNumber, password) => {
    try {
      setLoading(true);
      await login(phoneNumber, password);
      const userData = getUserResponseFromLocalStorage();
      setUser(userData);
      if (userData?.role?.name === 'ADMIN' || localStorage.getItem('user_role') === 'ROLE_ADMIN') {
        window.location.href = '/admin/dashboard';
        return { success: true };
      }
      return { success: true };

    } catch (error) {
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };


  const signOut = () => {
    logout();
    setUser(null);
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

