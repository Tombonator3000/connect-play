import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Error Boundary component to catch JavaScript errors in child components.
 * Prevents the entire app from crashing and shows a user-friendly error message.
 */
class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReload = () => {
    window.location.reload();
  };

  handleClearData = () => {
    if (confirm('This will clear all saved game data. Are you sure?')) {
      localStorage.clear();
      sessionStorage.clear();
      window.location.reload();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-stone-900 text-stone-200 flex items-center justify-center p-8">
          <div className="max-w-lg w-full bg-stone-800 border-2 border-red-800 rounded-xl p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">☠️</div>
              <h1 className="text-2xl font-bold text-red-400 mb-2">
                Something Went Wrong
              </h1>
              <p className="text-stone-400 text-sm">
                An unexpected error has occurred. The eldritch forces are beyond our control.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-stone-900 rounded-lg p-4 mb-6 overflow-x-auto">
                <p className="text-xs text-red-400 font-mono break-all">
                  {this.state.error.message}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="text-xs text-stone-500 cursor-pointer hover:text-stone-300">
                      Stack trace
                    </summary>
                    <pre className="text-xs text-stone-500 mt-2 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3">
              <button
                onClick={this.handleRetry}
                className="w-full py-3 bg-amber-700 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={this.handleReload}
                className="w-full py-3 bg-stone-700 hover:bg-stone-600 text-white font-bold rounded-lg transition-colors"
              >
                Reload Page
              </button>
              <button
                onClick={this.handleClearData}
                className="w-full py-2 text-sm text-stone-500 hover:text-red-400 transition-colors"
              >
                Clear All Data & Reload
              </button>
            </div>

            <p className="text-center text-xs text-stone-600 mt-6">
              If this error persists, try clearing your browser cache or contact support.
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
