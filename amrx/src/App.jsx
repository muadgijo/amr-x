import React, { useState, useEffect } from 'react';
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

// Simple error fallback
const ErrorFallback = ({ error, resetError }) => (
  <div className="min-h-screen bg-red-50 dark:bg-red-900 flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
      <div className="text-4xl mb-4">⚠️</div>
      <h1 className="text-xl font-bold text-red-600 mb-4">Something went wrong</h1>
      <p className="text-gray-600 dark:text-gray-300 mb-4">
        {error?.message || 'An unexpected error occurred'}
      </p>
      <button 
        onClick={resetError}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        Try Again
      </button>
    </div>
  </div>
);

// Main app content
function AppContent() {
  const [currentView, setCurrentView] = useState('landing');
  const [userType, setUserType] = useState(null);
  const { user, loading } = useAuth();

  // Show loading while checking authentication
  if (loading) {
    return <LoadingScreen />;
  }

  // If user is logged in, show pharmacist dashboard
  if (user && currentView !== 'pharmacist-dashboard') {
    setCurrentView('pharmacist-dashboard');
  }

  // Navigation functions
  const goToLanding = () => {
    setCurrentView('landing');
    setUserType(null);
  };

  const goToUserSelection = () => {
    setCurrentView('user-selection');
  };

  const selectUserType = (type) => {
    setUserType(type);
    if (type === 'public') {
      setCurrentView('public-form');
    } else if (type === 'pharmacist') {
      setCurrentView('auth');
    }
  };

  const goToPublicDashboard = () => {
    setCurrentView('public-dashboard');
  };

  const goToPharmacistDashboard = () => {
    setCurrentView('pharmacist-dashboard');
  };

  const logout = () => {
    setCurrentView('landing');
    setUserType(null);
  };

  // Beautiful background component
  const Background = () => (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-green-50 to-purple-50 dark:from-gray-900 dark:via-blue-900 dark:to-purple-900"></div>
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 dark:bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-20 w-72 h-72 bg-green-300 dark:bg-green-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-40 w-72 h-72 bg-purple-300 dark:bg-purple-600 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>
      <ParticleEffect />
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white transition-colors duration-300 relative overflow-hidden">
      <Background />
      
      {/* Route rendering */}
      {currentView === 'landing' && (
        <LandingPage onGetStarted={goToUserSelection} />
      )}
      
      {currentView === 'user-selection' && (
        <UserSelection onSelectUserType={selectUserType} />
      )}
      
      {currentView === 'public-form' && (
        <>
          <Header userType="public" />
          <main className="container mx-auto px-4 py-8 relative z-10">
            <PublicForm onSuccess={goToPublicDashboard} />
          </main>
          <Footer />
        </>
      )}
      
      {currentView === 'public-dashboard' && (
        <PublicDashboard 
          onBackToHome={goToLanding}
          onSubmitAgain={() => setCurrentView('public-form')}
        />
      )}
      
      {currentView === 'auth' && (
        <AuthPage 
          onAuthSuccess={goToPharmacistDashboard}
          onBackToSelection={() => setCurrentView('user-selection')}
        />
      )}
      
      {currentView === 'pharmacist-dashboard' && user && (
        <PharmacistDashboard onLogout={logout} />
      )}
    </div>
  );
}

// Main App component
export default function App() {
  return (
    <ErrorBoundary fallback={ErrorFallback}>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}