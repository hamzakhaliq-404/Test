import { useState, useEffect, useCallback, useRef } from 'react';
import { AlertTriangle, Clock, Zap, Activity } from 'lucide-react';

interface DiagnosticResult {
  inputLag: number;
  debounceDelay: number;
  stability: number;
  sampleCount: number;
}

export function DiagnosticTool() {
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<'lag' | 'debounce' | 'stability' | null>(null);
  const [results, setResults] = useState<DiagnosticResult | null>(null);
  const clickTimestamps = useRef<number[]>([]);
  const moveTimestamps = useRef<number[]>([]);
  const testTimeout = useRef<NodeJS.Timeout>();

  // Input lag measurement
  const handleLagTest = useCallback((e: MouseEvent) => {
    const now = performance.now();
    clickTimestamps.current.push(now - e.timeStamp);
  }, []);

  // Debounce delay measurement
  const handleDebounceTest = useCallback((e: MouseEvent) => {
    const now = performance.now();
    if (clickTimestamps.current.length > 0) {
      const lastClick = clickTimestamps.current[clickTimestamps.current.length - 1];
      if (now - lastClick > 5) { // Filter out duplicate events
        clickTimestamps.current.push(now);
      }
    } else {
      clickTimestamps.current.push(now);
    }
  }, []);

  // Stability test
  const handleStabilityTest = useCallback((e: MouseEvent) => {
    const now = performance.now();
    moveTimestamps.current.push(now);
  }, []);

  const startTest = useCallback(async () => {
    setIsRunning(true);
    setResults(null);
    clickTimestamps.current = [];
    moveTimestamps.current = [];

    // Input lag test
    setCurrentTest('lag');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Debounce test
    setCurrentTest('debounce');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Stability test
    setCurrentTest('stability');
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Calculate results
    const lagResults = clickTimestamps.current.slice(0, 10);
    const debounceDelays = clickTimestamps.current.slice(10)
      .map((time, i, arr) => i > 0 ? time - arr[i - 1] : 0)
      .filter(delay => delay > 5);
    const moveIntervals = moveTimestamps.current
      .map((time, i, arr) => i > 0 ? time - arr[i - 1] : 0)
      .filter(interval => interval > 0);

    const averageLag = lagResults.reduce((a, b) => a + b, 0) / lagResults.length;
    const minDebounce = Math.min(...debounceDelays) || 0;
    const stabilityScore = calculateStabilityScore(moveIntervals);

    setResults({
      inputLag: Math.round(averageLag),
      debounceDelay: Math.round(minDebounce),
      stability: Math.round(stabilityScore * 100),
      sampleCount: moveTimestamps.current.length
    });

    setCurrentTest(null);
    setIsRunning(false);
  }, []);

  useEffect(() => {
    if (isRunning) {
      switch (currentTest) {
        case 'lag':
          window.addEventListener('click', handleLagTest);
          return () => window.removeEventListener('click', handleLagTest);
        case 'debounce':
          window.addEventListener('click', handleDebounceTest);
          return () => window.removeEventListener('click', handleDebounceTest);
        case 'stability':
          window.addEventListener('mousemove', handleStabilityTest);
          return () => window.removeEventListener('mousemove', handleStabilityTest);
      }
    }
  }, [isRunning, currentTest, handleLagTest, handleDebounceTest, handleStabilityTest]);

  return (
    <div className="space-y-4">
      <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
        <h3 className="text-xl font-semibold mb-4">Mouse Diagnostics</h3>

        {!isRunning && !results && (
          <div className="text-center space-y-4">
            <p className="text-slate-400">
              This tool will test your mouse's input lag, debounce delay, and connection stability.
            </p>
            <button
              onClick={startTest}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg transition"
            >
              Start Diagnostic
            </button>
          </div>
        )}

        {isRunning && (
          <div className="space-y-4">
            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-blue-500 transition-all duration-300"
                style={{ 
                  width: `${
                    currentTest === 'lag' ? 33 : 
                    currentTest === 'debounce' ? 66 : 
                    currentTest === 'stability' ? 100 : 0
                  }%` 
                }}
              />
            </div>
            
            <div className="text-center">
              {currentTest === 'lag' && (
                <p className="text-slate-400">Click repeatedly when the indicator appears...</p>
              )}
              {currentTest === 'debounce' && (
                <p className="text-slate-400">Click as fast as you can...</p>
              )}
              {currentTest === 'stability' && (
                <p className="text-slate-400">Move your mouse around smoothly...</p>
              )}
            </div>
          </div>
        )}

        {results && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <DiagnosticCard
                icon={Clock}
                label="Input Lag"
                value={`${results.inputLag}ms`}
                rating={results.inputLag < 10 ? 'good' : results.inputLag < 20 ? 'medium' : 'poor'}
              />
              <DiagnosticCard
                icon={Zap}
                label="Debounce Delay"
                value={`${results.debounceDelay}ms`}
                rating={results.debounceDelay < 10 ? 'good' : results.debounceDelay < 20 ? 'medium' : 'poor'}
              />
              <DiagnosticCard
                icon={Activity}
                label="Stability"
                value={`${results.stability}%`}
                rating={results.stability > 90 ? 'good' : results.stability > 75 ? 'medium' : 'poor'}
              />
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={startTest}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
              >
                Run Again
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface DiagnosticCardProps {
  icon: React.ComponentType<any>;
  label: string;
  value: string;
  rating: 'good' | 'medium' | 'poor';
}

function DiagnosticCard({ icon: Icon, label, value, rating }: DiagnosticCardProps) {
  const ratingColors = {
    good: 'text-green-400',
    medium: 'text-yellow-400',
    poor: 'text-red-400'
  };

  return (
    <div className="bg-slate-700/50 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-5 h-5 text-slate-400" />
        <span className="text-slate-400">{label}</span>
      </div>
      <div className={`text-2xl font-bold ${ratingColors[rating]}`}>
        {value}
      </div>
    </div>
  );
}

function calculateStabilityScore(intervals: number[]): number {
  if (intervals.length === 0) return 0;

  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / intervals.length;
  const stdDev = Math.sqrt(variance);

  // Calculate coefficient of variation (CV)
  const cv = stdDev / mean;

  // Convert CV to a 0-1 score (lower CV means higher stability)
  const score = Math.max(0, Math.min(1, 1 - cv));

  return score;
}