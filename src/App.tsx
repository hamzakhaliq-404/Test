import { useState, useCallback, useEffect } from 'react';
import { TestArea } from './components/TestArea';
import { StatsDisplay } from './components/StatsDisplay';
import { PollingGraph } from './components/PollingGraph';
import { AnalysisPanel } from './components/AnalysisPanel';
import { LeaderboardPanel } from './components/LeaderboardPanel';
import { SaveSessionModal } from './components/SaveSessionModal';
import { ThemeSwitcher } from './components/ThemeSwitcher';
import { LoadingScreen } from './components/LoadingScreen';
import { validatePollingData, safeLocalStorage } from './utils/validation';
import type { LeaderboardEntry } from './types/user';

interface DataPoint {
  timestamp: number;
  rate: number;
}

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [data, setData] = useState<DataPoint[]>([]);
  const [currentRate, setCurrentRate] = useState(0);
  const [averageRate, setAverageRate] = useState(0);
  const [maxRate, setMaxRate] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        if (!safeLocalStorage.isAvailable()) {
          throw new Error('Local storage is not available');
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        setIsLoading(false);
      } catch (err) {
        console.error('Error initializing app:', err);
        setLoadError(err instanceof Error ? err.message : 'Failed to initialize application');
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const handlePollingUpdate = useCallback((rate: number) => {
    const timestamp = Date.now();
    setCurrentRate(rate);
    setData(prev => {
      const newData = [...prev, { timestamp, rate }];
      const sum = newData.reduce((acc, point) => acc + point.rate, 0);
      setAverageRate(Math.round(sum / newData.length));
      setMaxRate(Math.max(rate, maxRate));
      return newData;
    });
  }, [maxRate]);

  const handleStartStop = () => {
    if (isTracking) {
      setIsTracking(false);
    } else {
      setError(null);
      setData([]);
      setCurrentRate(0);
      setAverageRate(0);
      setMaxRate(0);
      setIsTracking(true);
    }
  };

  const handleSaveSession = useCallback(async (username: string) => {
    try {
      const validationError = validatePollingData(data);
      if (validationError) {
        throw new Error(validationError);
      }

      const session: LeaderboardEntry = {
        date: new Date().toISOString(),
        averageRate,
        maxRate,
        dataPoints: data.length,
        username,
      };

      const leaderboard = safeLocalStorage.getJSON<LeaderboardEntry[]>('globalLeaderboard', []);
      leaderboard.push(session);
      const sortedLeaderboard = leaderboard.sort((a, b) => b.maxRate - a.maxRate);
      
      if (!safeLocalStorage.setJSON('globalLeaderboard', sortedLeaderboard)) {
        throw new Error('Failed to update leaderboard');
      }

      setIsSaveModalOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving session');
      console.error('Error saving session:', err);
    }
  }, [averageRate, maxRate, data]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (loadError) {
    return (
      <div className="min-h-screen grid place-items-center p-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="text-2xl font-bold text-red-500">Unable to Load Application</h1>
          <p className="text-slate-400">{loadError}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-6">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold neon-text">Mouse Polling Rate Tester</h1>
        <ThemeSwitcher />
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <StatsDisplay
            currentRate={currentRate}
            averageRate={averageRate}
            maxRate={maxRate}
          />

          <TestArea
            onPollingUpdate={handlePollingUpdate}
            isTracking={isTracking}
          />

          <div className="flex gap-4">
            <button
              onClick={handleStartStop}
              className={`flex-1 btn ${
                isTracking
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-blue-500 hover:bg-blue-600'
              }`}
            >
              {isTracking ? 'Stop' : 'Start'}
            </button>

            <button
              onClick={() => setIsSaveModalOpen(true)}
              className="flex-1 btn btn-secondary"
              disabled={data.length === 0}
            >
              Save Result
            </button>
          </div>

          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
              {error}
            </div>
          )}

          <PollingGraph data={data} />
          <AnalysisPanel
            data={data}
            averageRate={averageRate}
            maxRate={maxRate}
          />
        </div>

        <div className="space-y-6">
          <LeaderboardPanel />
        </div>
      </div>

      <SaveSessionModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        onSave={handleSaveSession}
      />
    </div>
  );
}

export default App;