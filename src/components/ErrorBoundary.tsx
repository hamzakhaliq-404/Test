import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4"
             style={{ backgroundColor: 'var(--background-primary)' }}>
          <div className="max-w-md w-full space-y-6">
            <div className="text-center space-y-2">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4" style={{ color: 'var(--text-accent)' }} />
              <h1 className="text-2xl font-bold" style={{ color: 'var(--text-primary)' }}>
                Something went wrong
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>
                We encountered an error while loading the application.
              </p>
            </div>
            
            {this.state.error && (
              <div className="rounded-lg p-4 space-y-2" 
                   style={{ 
                     backgroundColor: 'var(--background-elevated)',
                     borderColor: 'var(--border-color)',
                     borderWidth: '1px'
                   }}>
                <p className="font-mono text-sm" style={{ color: 'var(--text-accent)' }}>
                  {this.state.error.message}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm" style={{ color: 'var(--text-secondary)' }}>
                      View details
                    </summary>
                    <pre className="mt-2 p-2 rounded text-xs overflow-auto max-h-48 custom-scrollbar" 
                         style={{ 
                           backgroundColor: 'var(--background-primary)',
                           color: 'var(--text-secondary)'
                         }}>
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex justify-center">
              <button
                onClick={this.handleReload}
                className="flex items-center gap-2 px-6 py-3 rounded-lg transition-all duration-200"
                style={{
                  backgroundColor: 'var(--text-accent)',
                  color: 'var(--background-primary)'
                }}
              >
                <RefreshCw className="w-4 h-4" />
                Reload Application
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}