import React from 'react';
import { useForm } from '../../hooks/useForm';
import { FormField, Input, Button } from '../ui/FormField';
import ApiService from '../../services/api';

export const PharmacistLogin = ({ onLoginSuccess, onBackToSelection }) => {
  const validationRules = {
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

  const {
    formData,
    errors,
    loading,
    success,
    apiError,
    handleChange,
    submitForm
  } = useForm({
    email: '',
    password: ''
  }, validationRules);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await ApiService.loginPharmacist(formData);
      localStorage.setItem('pharmacistToken', response.token);
      localStorage.setItem('pharmacistData', JSON.stringify(response.pharmacist));
      onLoginSuccess(response.pharmacist);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm rounded-3xl p-8 shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mb-4">
              <span className="text-3xl" role="img" aria-label="Pharmacist">💊</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
              Healthcare Professional Login
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Access your professional dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
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
                autoComplete="current-password"
              />
            </FormField>

            {apiError && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
                <p className="text-red-600 dark:text-red-400 text-sm flex items-center">
                  <span className="mr-2" role="img" aria-label="Error">⚠️</span>
                  {apiError}
                </p>
              </div>
            )}

            {success && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                <p className="text-green-600 dark:text-green-400 text-sm flex items-center">
                  <span className="mr-2" role="img" aria-label="Success">✅</span>
                  {success}
                </p>
              </div>
            )}

            <Button
              type="submit"
              loading={loading}
              className="w-full"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
              Don't have an account? Contact your administrator
            </p>
            <button
              onClick={onBackToSelection}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-medium transition-colors duration-200"
            >
              ← Back to selection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}; 