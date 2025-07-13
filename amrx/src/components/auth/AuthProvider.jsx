import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check for existing session on app load
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('pharmacistToken');
      const userData = localStorage.getItem('pharmacistData');
      
      if (token && userData) {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      const response = await ApiService.loginPharmacist(credentials);
      
      if (response.success) {
        localStorage.setItem('pharmacistToken', response.token);
        localStorage.setItem('pharmacistData', JSON.stringify(response.pharmacist));
        setUser(response.pharmacist);
        return { success: true, user: response.pharmacist };
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const response = await ApiService.registerPharmacist(userData);
      
      if (response.success) {
        localStorage.setItem('pharmacistToken', response.token);
        localStorage.setItem('pharmacistData', JSON.stringify(response.pharmacist));
        setUser(response.pharmacist);
        return { success: true, user: response.pharmacist };
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('pharmacistToken');
    localStorage.removeItem('pharmacistData');
    setUser(null);
    setError(null);
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    clearError,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 