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

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h1>
            <p className="text-red-500 mb-4">{this.state.error?.message}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main App Component with Authentication
function AppContent() {
  const [currentView, setCurrentView] = useState('landing');
  const [userType, setUserType] = useState(null);
  const [publicSubmitted, setPublicSubmitted] = useState(false);
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    // Only redirect to dashboard if user is authenticated
    if (user && currentView === 'landing') {
      setCurrentView('pharmacist-dashboard');
    }
  }, [user, currentView]);

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
  };

  // Show loading screen only during auth check
  if (authLoading) {
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
    </div>
  );
}

// Main App Component with AuthProvider wrapper
export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}