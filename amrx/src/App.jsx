import React, { useState, useEffect, Suspense, lazy } from 'react';
import { ThemeProvider } from './components/ThemeContext';
import { AuthProvider, useAuth } from './components/auth/AuthProvider';
import { LoadingScreen } from './components/LoadingScreen';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { UserSelection } from './components/UserSelection';
import { PublicForm } from './components/PublicForm';
import { AuthPage } from './components/auth/AuthPage';
import { PharmacistDashboard } from './components/pharmacist/PharmacistDashboard';
import { Footer } from './components/Footer';
import { ParticleEffect } from './components/ParticleEffect';
import { PublicDashboard } from './components/PublicDashboard';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load components for better performance
const LazyPublicDashboard = lazy(() => import('./components/PublicDashboard').then(module => ({ default: module.PublicDashboard })));
const LazyPharmacistDashboard = lazy(() => import('./components/pharmacist/PharmacistDashboard').then(module => ({ default: module.PharmacistDashboard })));

// Enhanced Error Boundary Component
const AppErrorFallback = ({ error, retryCount, maxRetries, onRetry, onReset, onReload, onGoHome }) => (
  <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-red-900 flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-red-200 dark:border-red-800">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
          <span className="text-3xl" role="img" aria-label="Error">⚠️</span>
        </div>
        <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
          Application Error
        </h1>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          {error?.message || 'An unexpected error occurred in the application'}
        </p>
        <div className="space-y-3">
          {retryCount < maxRetries && (
            <button 
              onClick={onRetry}
              className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors duration-300"
            >
              Try Again ({retryCount + 1}/{maxRetries})
            </button>
          )}
          <button 
            onClick={onReset}
            className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors duration-300"
          >
            Reset Application
          </button>
          <button 
            onClick={onReload}
            className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors duration-300"
          >
            Reload Page
          </button>
        </div>
      </div>
    </div>
  </div>
);

// Main App Component with Authentication
function AppContent() {
  const [currentView, setCurrentView] = useState('landing');
  const [userType, setUserType] = useState(null);
  const [publicSubmitted, setPublicSubmitted] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // Initialize app state
    const initializeApp = async () => {
      try {
        // Check for any stored state
        const storedView = localStorage.getItem('amr-current-view');
        const storedUserType = localStorage.getItem('amr-user-type');
        
        if (storedView && storedUserType) {
          setCurrentView(storedView);
          setUserType(storedUserType);
        }
        
        // Only redirect to dashboard if user is authenticated
        if (user && currentView === 'landing') {
          setCurrentView('pharmacist-dashboard');
        }
      } catch (error) {
        console.error('App initialization error:', error);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, [user, currentView]);

  // Store current view in localStorage
  useEffect(() => {
    if (!isInitializing) {
      localStorage.setItem('amr-current-view', currentView);
      if (userType) {
        localStorage.setItem('amr-user-type', userType);
      }
    }
  }, [currentView, userType, isInitializing]);

  const handleGetStarted = () => {
    setCurrentView('user-selection');
  };

  const handleUserTypeSelection = (type) => {
    setUserType(type);
    setPublicSubmitted(false);
    if (type === 'public') {
      setCurrentView('public-form');
    } else if (type === 'pharmacist') {
      setCurrentView('auth');
    }
  };

  const handlePublicSubmitSuccess = () => {
    setPublicSubmitted(true);
    setCurrentView('public-dashboard');
  };

  const handleAuthSuccess = (userData) => {
    setCurrentView('pharmacist-dashboard');
  };

  const handleLogout = () => {
    setCurrentView('landing');
    localStorage.removeItem('amr-current-view');
    localStorage.removeItem('amr-user-type');
  };

  const handleBackToSelection = () => {
    setCurrentView('user-selection');
  };

  const handlePublicSubmitAgain = () => {
    setPublicSubmitted(false);
    setCurrentView('public-form');
  };

  const handlePublicBackToHome = () => {
    setPublicSubmitted(false);
    setCurrentView('landing');
    localStorage.removeItem('amr-current-view');
    localStorage.removeItem('amr-user-type');
  };

  // Show loading screen during auth check or initialization
  if (authLoading || isInitializing) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900"></div>
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 dark:bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute top-40 right-20 w-72 h-72 bg-green-300 dark:bg-green-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-40 w-72 h-72 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        {/* Floating Particles */}
        <ParticleEffect />
      </div>

      {/* Route-based rendering with Suspense for lazy-loaded components */}
      <Suspense fallback={<LoadingScreen />}>
        {currentView === 'landing' && (
          <LandingPage onGetStarted={handleGetStarted} />
        )}

        {currentView === 'user-selection' && (
          <UserSelection onSelectUserType={handleUserTypeSelection} />
        )}

        {currentView === 'public-form' && (
          <>
            <Header userType="public" />
            <main className="container mx-auto px-4 py-8 relative z-10">
              <PublicForm onSuccess={handlePublicSubmitSuccess} />
            </main>
            <Footer />
          </>
        )}

        {currentView === 'public-dashboard' && (
          <PublicDashboard 
            onBackToHome={handlePublicBackToHome}
            onSubmitAgain={handlePublicSubmitAgain}
          />
        )}

        {currentView === 'auth' && (
          <AuthPage 
            onAuthSuccess={handleAuthSuccess}
            onBackToSelection={handleBackToSelection}
          />
        )}

        {currentView === 'pharmacist-dashboard' && user && (
          <PharmacistDashboard 
            pharmacist={user}
            onLogout={handleLogout}
          />
        )}
      </Suspense>
    </div>
  );
}

// Main App Component with ErrorBoundary and AuthProvider wrapper
export default function App() {
  return (
    <ErrorBoundary 
      fallback={<AppErrorFallback />}
      maxRetries={3}
      showDetails={import.meta.env.DEV}
    >
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}