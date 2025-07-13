import React, { useState } from 'react';
import { useAuth } from './AuthProvider';
import { useForm } from '../../hooks/useForm';
import { FormField, Input, Button } from '../ui/FormField';

export const AuthPage = ({ onBackToSelection, onAuthSuccess }) => {
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'signup'
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, signup, error, clearError } = useAuth();

  const loginValidationRules = {
    email: {
      required: 'Email is required',
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    },
    password: {
      required: 'Password is required',
      min: 6,
      message: 'Password must be at least 6 characters'
    }
  };

  const signupValidationRules = {
    name: { required: 'Full name is required' },
    email: {
      required: 'Email is required',
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      message: 'Please enter a valid email address'
    },
    password: {
      required: 'Password is required',
      min: 6,
      message: 'Password must be at least 6 characters'
    },
    confirmPassword: {
      required: 'Please confirm your password'
    },
    institution: { required: 'Institution is required' }
  };

  const {
    formData,
    errors,
    loading,
    handleChange,
    validateForm,
    resetForm
  } = useForm(
    authMode === 'login' 
      ? { email: '', password: '' }
      : { name: '', email: '', password: '', confirmPassword: '', institution: '' },
    authMode === 'login' ? loginValidationRules : signupValidationRules
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();

    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    if (authMode === 'signup' && formData.password !== formData.confirmPassword) {
      return;
    }

    try {
      let result;
      if (authMode === 'login') {
        result = await login({ email: formData.email, password: formData.password });
      } else {
        result = await signup({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          institution: formData.institution
        });
      }

      if (result.success) {
        onAuthSuccess(result.user);
      }
    } catch (error) {
      console.error('Authentication failed:', error);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setGoogleLoading(true);
      clearError();
      
      // For demo purposes, we'll simulate Google login
      const demoUser = {
        id: 'google_demo_user',
        name: 'Google Demo User',
        email: 'demo@google.com',
        institution: 'Google Healthcare'
      };
      
      // In a real app, you would integrate with Google OAuth
      localStorage.setItem('pharmacistToken', 'google_demo_token');
      localStorage.setItem('pharmacistData', JSON.stringify(demoUser));
      
      // Trigger auth state update
      onAuthSuccess(demoUser);
      
      // Force a page refresh to ensure all components update
      setTimeout(() => {
        window.location.reload();
      }, 100);
      
    } catch (error) {
      console.error('Google login failed:', error);
      setGoogleLoading(false);
    }
  };

  const switchMode = () => {
    setAuthMode(authMode === 'login' ? 'signup' : 'login');
    resetForm();
    clearError();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
              <span className="text-3xl" role="img" aria-label="Healthcare">💊</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              {authMode === 'login' ? 'Welcome Back' : 'Create Account'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {authMode === 'login' 
                ? 'Sign in to access your professional dashboard'
                : 'Join AMR-X as a healthcare professional'
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {authMode === 'signup' && (
              <FormField
                label="Full Name"
                icon="👤"
                error={errors.name}
                required
              >
                <Input
                  id="name"
                  name="name"
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Enter your full name"
                  error={errors.name}
                  autoComplete="name"
                />
              </FormField>
            )}

            <FormField
              label="Email Address"
              icon="📧"
              error={errors.email}
              required
            >
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                error={errors.email}
                autoComplete="email"
              />
            </FormField>

            <FormField
              label="Password"
              icon="🔒"
              error={errors.password}
              required
            >
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                error={errors.password}
                autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
              />
            </FormField>

            {authMode === 'signup' && (
              <>
                <FormField
                  label="Confirm Password"
                  icon="🔐"
                  error={errors.confirmPassword}
                  required
                >
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirm your password"
                    error={errors.confirmPassword}
                    autoComplete="new-password"
                  />
                </FormField>

                <FormField
                  label="Institution"
                  icon="🏥"
                  error={errors.institution}
                  required
                >
                  <Input
                    id="institution"
                    name="institution"
                    type="text"
                    value={formData.institution}
                    onChange={handleChange}
                    placeholder="Hospital, Clinic, or Organization"
                    error={errors.institution}
                    autoComplete="organization"
                  />
                </FormField>
              </>
            )}

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <p className="text-red-600 dark:text-red-400 text-sm flex items-center">
                  <span className="mr-2" role="img" aria-label="Error">⚠️</span>
                  {error}
                </p>
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full"
            >
              {authMode === 'login' ? 'Sign In' : 'Create Account'}
            </Button>

            {/* Google Login Button */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <Button
              type="button"
              variant="secondary"
              onClick={handleGoogleLogin}
              loading={googleLoading}
              className="w-full"
            >
              <span className="mr-2" role="img" aria-label="Google">🔍</span>
              Continue with Google
            </Button>
          </form>

          <div className="mt-6 text-center space-y-4">
            <button
              onClick={switchMode}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors duration-200"
            >
              {authMode === 'login' 
                ? "Don't have an account? Sign up" 
                : 'Already have an account? Sign in'
              }
            </button>
            
            <div>
              <button
                onClick={onBackToSelection}
                className="text-gray-600 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 text-sm font-medium transition-colors duration-200"
              >
                ← Back to selection
              </button>
            </div>

            {authMode === 'login' && (
              <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                <p className="font-semibold mb-1">Demo credentials:</p>
                <p>Email: <span className="font-mono">demo@amrx.com</span></p>
                <p>Password: <span className="font-mono">demo123</span></p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}; 