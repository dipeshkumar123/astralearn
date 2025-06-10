import React from 'react';

class AdaptiveLearningErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log error to console and external service
    console.error('Adaptive Learning Error Boundary caught an error:', error, errorInfo);
    
    this.setState({
      error,
      errorInfo
    });

    // Send error to monitoring service
    this.reportError(error, errorInfo);
  }

  reportError = async (error, errorInfo) => {
    try {
      const errorReport = {
        errorId: this.state.errorId,
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        timestamp: new Date().toISOString(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        userId: localStorage.getItem('userId') || 'anonymous',
        component: 'AdaptiveLearningSystem'
      };

      // Log to console for development
      console.error('Error Report:', errorReport);

      // In production, you would send this to your error monitoring service
      // await fetch('/api/errors', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(errorReport)
      // });

    } catch (reportingError) {
      console.error('Failed to report error:', reportingError);
    }
  };

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                Adaptive Learning System Error
              </h2>
              
              <p className="text-gray-600 mb-6">
                We encountered an unexpected error in the adaptive learning system. 
                Don't worry, your progress has been saved.
              </p>

              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="text-sm font-medium text-gray-900 mb-2">Error Details</h3>
                <p className="text-xs text-gray-600 mb-2">
                  <strong>Error ID:</strong> {this.state.errorId}
                </p>
                <p className="text-xs text-gray-600 mb-2">
                  <strong>Message:</strong> {this.state.error?.message}
                </p>
                {process.env.NODE_ENV === 'development' && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer">
                      Technical Details (Dev Mode)
                    </summary>
                    <pre className="text-xs text-gray-500 mt-2 overflow-x-auto">
                      {this.state.error?.stack}
                    </pre>
                  </details>
                )}
              </div>

              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  Try Again
                </button>
                
                <button
                  onClick={this.handleReload}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Reload Page
                </button>

                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Go to Home
                </button>
              </div>

              <div className="mt-6 text-xs text-gray-500">
                <p>
                  If this problem persists, please contact support with error ID: 
                  <code className="bg-gray-100 px-1 py-0.5 rounded ml-1">
                    {this.state.errorId}
                  </code>
                </p>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AdaptiveLearningErrorBoundary;
