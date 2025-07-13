import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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
  const [initialized, setInitialized] = useState(false);

  // Memoize the checkAuthStatus function to prevent unnecessary re-renders
  const checkAuthStatus = useCallback(async () => {
    if (initialized) return; // Prevent multiple initializations
    
    try {
      console.log('AuthProvider: Starting auth check...');
      const token = localStorage.getItem('pharmacistToken');
      const userData = localStorage.getItem('pharmacistData');
      
      console.log('AuthProvider: Found token:', !!token, 'userData:', !!userData);
      
      if (token && userData) {
        // Verify token is still valid
        if (ApiService.isAuthenticated()) {
          const parsedUser = JSON.parse(userData);
          setUser(parsedUser);
          console.log('AuthProvider: User authenticated:', parsedUser.email);
        } else {
          console.log('AuthProvider: Token expired, logging out');
          logout();
        }
      } else {
        console.log('AuthProvider: No valid auth data found');
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      logout();
    } finally {
      setLoading(false);
      setInitialized(true);
      console.log('AuthProvider: Setting loading to false');
    }
  }, [initialized]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const login = useCallback(async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      console.log('AuthProvider: Attempting login...');
      
      const response = await ApiService.loginPharmacist(credentials);
      
      if (response.success && response.token && response.pharmacist) {
        localStorage.setItem('pharmacistToken', response.token);
        localStorage.setItem('pharmacistData', JSON.stringify(response.pharmacist));
        setUser(response.pharmacist);
        console.log('AuthProvider: Login successful');
        return { success: true, user: response.pharmacist };
      } else {
        throw new Error(response.error || 'Login failed');
      }
    } catch (error) {
      console.error('AuthProvider: Login error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (userData) => {
    try {
      setError(null);
      setLoading(true);
      console.log('AuthProvider: Attempting signup...');
      
      const response = await ApiService.registerPharmacist(userData);
      
      if (response.success && response.token && response.pharmacist) {
        localStorage.setItem('pharmacistToken', response.token);
        localStorage.setItem('pharmacistData', JSON.stringify(response.pharmacist));
        setUser(response.pharmacist);
        console.log('AuthProvider: Signup successful');
        return { success: true, user: response.pharmacist };
      } else {
        throw new Error(response.error || 'Registration failed');
      }
    } catch (error) {
      console.error('AuthProvider: Signup error:', error);
      setError(error.message);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    console.log('AuthProvider: Logging out...');
    localStorage.removeItem('pharmacistToken');
    localStorage.removeItem('pharmacistData');
    setUser(null);
    setError(null);
    setInitialized(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    loading,
    error,
    login,
    signup,
    logout,
    clearError,
    isAuthenticated: !!user,
    initialized
  }), [user, loading, error, login, signup, logout, clearError, initialized]);

  // Only render once the provider is initialized
  if (!initialized && loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 