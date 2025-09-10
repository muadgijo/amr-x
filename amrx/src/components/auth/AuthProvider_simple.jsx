import React, { createContext, useContext, useState, useEffect } from 'react';
import ApiService from '../../services/api_simple';
import { LoadingScreen } from '../LoadingScreen';

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

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = () => {
      try {
        const token = localStorage.getItem('pharmacistToken');
        const userData = localStorage.getItem('pharmacistData');
        
        if (token && userData && ApiService.isAuthenticated()) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
        } else {
          ApiService.clearAuth();
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        ApiService.clearAuth();
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await ApiService.loginPharmacist(credentials);
      
      if (response.success && response.token && response.pharmacist) {
        localStorage.setItem('pharmacistToken', response.token);
        localStorage.setItem('pharmacistData', JSON.stringify(response.pharmacist));
        setUser(response.pharmacist);
        return { success: true, user: response.pharmacist };
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Signup function
  const signup = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      
      const response = await ApiService.registerPharmacist(userData);
      
      if (response.success) {
        return { success: true, message: response.message };
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    ApiService.clearAuth();
    setUser(null);
    setError(null);
  };

  // Clear error function
  const clearError = () => {
    setError(null);
  };

  // Show loading screen while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  // Context value
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
