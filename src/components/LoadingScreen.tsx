import { Loader2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeProvider';
import { useEffect, useState } from 'react';

export function LoadingScreen() {
  const { theme } = useTheme();
  const [showSlowLoadMessage, setShowSlowLoadMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  
  useEffect(() => {
    // Show "taking longer than usual" message after 5 seconds
    const slowLoadTimeout = setTimeout(() => {
      setShowSlowLoadMessage(true);
    }, 5000);

    // Show error message after 15 seconds
    const errorTimeout = setTimeout(() => {
      setShowErrorMessage(true);
    }, 15000);

    return () => {
      clearTimeout(slowLoadTimeout);
      clearTimeout(errorTimeout);
    };
  }, []);

  return (
    <div className="fixed inset-0 grid place-items-center"
         style={{ backgroundColor: 'var(--background-primary)' }}>
      <div className="text-center space-y-4 p-4 max-w-md">
        <Loader2 className="w-12 h-12 mx-auto animate-spin" 
                style={{ color: 'var(--text-accent)' }} />
        
        <h2 className="text-xl font-medium animate-pulse"
            style={{ color: 'var(--text-primary)' }}>
          Loading Mouse Metrics...
        </h2>

        {showSlowLoadMessage && !showErrorMessage && (
          <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
            This is taking longer than usual. Please wait while we initialize the application...
          </p>
        )}

        {showErrorMessage && (
          <div className="space-y-4">
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>
              We're having trouble loading the application. You can try:
            </p>
            <ul className="text-sm space-y-2" style={{ color: 'var(--text-secondary)' }}>
              <li>• Checking your internet connection</li>
              <li>• Refreshing the page</li>
              <li>• Clearing your browser cache</li>
            </ul>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-lg transition-all duration-200"
              style={{
                backgroundColor: 'var(--text-accent)',
                color: 'var(--background-primary)'
              }}
            >
              Refresh Page
            </button>
          </div>
        )}
      </div>
    </div>
  );
}