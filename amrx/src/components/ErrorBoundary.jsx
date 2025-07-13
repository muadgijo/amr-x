import React from 'react';
import PropTypes from 'prop-types';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error Boundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
    
    // Log error to service (you can implement this)
    this.logErrorToService(error, errorInfo);
  }

  logErrorToService = (error, errorInfo) => {
    // In a real app, you would send this to your error reporting service
    // like Sentry, LogRocket, or your own error tracking system
    const errorData = {
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      retryCount: this.state.retryCount
    };

    console.error('Error data for reporting:', errorData);
    
    // Example: Send to your error reporting service
    // fetch('/api/errors', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(errorData)
    // }).catch(console.error);
  };

  handleRetry = () => {
    const { retryCount } = this.state;
    const maxRetries = this.props.maxRetries || 3;
    
    if (retryCount >= maxRetries) {
      this.handleReset();
      return;
    }

    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
      isRetrying: true
    }));

    // Add a small delay to show retry animation
    setTimeout(() => {
      this.setState({ isRetrying: false });
    }, 1000);
  };

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
      isRetrying: false
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  render() {
    const { hasError, error, errorInfo, retryCount, isRetrying } = this.state;
    const { children, fallback, maxRetries = 3, showDetails = false } = this.props;

    if (hasError) {
      // Custom fallback component
      if (fallback) {
        return React.cloneElement(fallback, {
          error,
          errorInfo,
          retryCount,
          maxRetries,
          onRetry: this.handleRetry,
          onReset: this.handleReset,
          onReload: this.handleReload,
          onGoHome: this.handleGoHome
        });
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-red-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-red-200 dark:border-red-800">
            <div className="text-center">
              {/* Error Icon */}
              <div className="mx-auto w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl" role="img" aria-label="Error">
                  {isRetrying ? '🔄' : '⚠️'}
                </span>
              </div>

              {/* Error Title */}
              <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
                {isRetrying ? 'Retrying...' : 'Something went wrong'}
              </h1>

              {/* Error Message */}
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                {isRetrying 
                  ? `Attempt ${retryCount + 1} of ${maxRetries}...`
                  : error?.message || 'An unexpected error occurred'
                }
              </p>

              {/* Action Buttons */}
              {!isRetrying && (
                <div className="space-y-3">
                  {retryCount < maxRetries && (
                    <button 
                      onClick={this.handleRetry}
                      className="w-full px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition-colors duration-300 flex items-center justify-center"
                    >
                      <span className="mr-2" role="img" aria-label="Retry">🔄</span>
                      Try Again ({retryCount + 1}/{maxRetries})
                    </button>
                  )}

                  <button 
                    onClick={this.handleReset}
                    className="w-full px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-xl font-semibold transition-colors duration-300 flex items-center justify-center"
                  >
                    <span className="mr-2" role="img" aria-label="Reset">🔄</span>
                    Reset Application
                  </button>

                  <button 
                    onClick={this.handleReload}
                    className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-colors duration-300 flex items-center justify-center"
                  >
                    <span className="mr-2" role="img" aria-label="Reload">🔄</span>
                    Reload Page
                  </button>

                  <button 
                    onClick={this.handleGoHome}
                    className="w-full px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-colors duration-300 flex items-center justify-center"
                  >
                    <span className="mr-2" role="img" aria-label="Home">🏠</span>
                    Go to Home
                  </button>
                </div>
              )}

              {/* Error Details (for development) */}
              {showDetails && errorInfo && (
                <details className="mt-6 text-left">
                  <summary className="cursor-pointer text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200">
                    Error Details
                  </summary>
                  <div className="mt-2 p-4 bg-gray-100 dark:bg-gray-700 rounded-lg text-xs font-mono text-gray-800 dark:text-gray-200 overflow-auto max-h-40">
                    <div className="mb-2">
                      <strong>Error:</strong> {error?.toString()}
                    </div>
                    <div>
                      <strong>Component Stack:</strong>
                      <pre className="whitespace-pre-wrap mt-1">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  </div>
                </details>
              )}

              {/* Contact Support */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  If this problem persists, please contact support.
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.element,
  maxRetries: PropTypes.number,
  showDetails: PropTypes.bool
};

export default ErrorBoundary; 