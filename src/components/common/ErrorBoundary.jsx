import React from 'react';
import styles from './ErrorBoundary.module.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    
    // Store error info for debugging
    this.setState({ errorInfo });
    
    // Try to report error to analytics if available
    try {
      const errorData = {
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href
      };
      
      // Store in localStorage for debugging
      const recentErrors = JSON.parse(localStorage.getItem('recentErrors') || '[]');
      recentErrors.unshift(errorData);
      // Keep only last 5 errors
      localStorage.setItem('recentErrors', JSON.stringify(recentErrors.slice(0, 5)));
    } catch (e) {
      console.warn('Failed to store error info:', e);
    }
  }

  handleRetry = () => {
    // Clear the error state and try to recover
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    // Clear any potentially corrupted state and reload
    try {
      // Clear service worker caches if available
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
          registrations.forEach(registration => {
            registration.unregister();
          });
        });
      }
    } catch (e) {
      console.warn('Failed to clear service worker:', e);
    }
    
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <h1>Oops! Something went wrong</h1>
            <p>We're sorry, but something unexpected happened.</p>
            
            {/* Show error details in development */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className={styles.errorDetails}>
                <summary>Error Details</summary>
                <pre>{this.state.error.toString()}</pre>
                {this.state.errorInfo && (
                  <pre>{this.state.errorInfo.componentStack}</pre>
                )}
              </details>
            )}
            
            <div className={styles.errorActions}>
              <button 
                className={styles.retryButton}
                onClick={this.handleRetry}
              >
                Try Again
              </button>
              <button 
                className={styles.reloadButton}
                onClick={this.handleReload}
              >
                Reload Page
              </button>
            </div>
            
            <p className={styles.errorHint}>
              If this keeps happening, try clearing your browser cache or restarting the PWA.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
