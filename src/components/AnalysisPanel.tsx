import { Brain, AlertTriangle, CheckCircle } from 'lucide-react';
import { useMemo } from 'react';

interface DataPoint {
  timestamp: number;
  rate: number;
}

interface AnalysisPanelProps {
  data: DataPoint[];
  averageRate: number;
  maxRate: number;
}

export function AnalysisPanel({ data, averageRate, maxRate }: AnalysisPanelProps) {
  const analyses = useMemo(() => {
    if (data.length < 10) {
      return [];
    }
    return analyzePollingData(data, averageRate, maxRate);
  }, [data, averageRate, maxRate]);

  if (data.length < 10) {
    return null;
  }

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-purple-400" />
        <h3 className="text-lg font-semibold text-white">Analysis</h3>
      </div>
      <div className="space-y-3">
        {analyses.map((analysis, index) => (
          <AnalysisItem key={index} {...analysis} />
        ))}
      </div>
    </div>
  );
}

interface AnalysisItem {
  type: 'warning' | 'info' | 'success';
  message: string;
}

function AnalysisItem({ type, message }: AnalysisItem) {
  const icons = {
    warning: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    success: <CheckCircle className="w-5 h-5 text-green-400" />,
    info: <Brain className="w-5 h-5 text-blue-400" />
  };

  const backgrounds = {
    warning: 'bg-amber-500/10',
    success: 'bg-green-500/10',
    info: 'bg-blue-500/10'
  };

  return (
    <div className={`flex items-start gap-3 p-3 rounded-lg ${backgrounds[type]}`}>
      {icons[type]}
      <p className="text-slate-200 text-sm">{message}</p>
    </div>
  );
}

function analyzePollingData(data: DataPoint[], averageRate: number, maxRate: number): AnalysisItem[] {
  const analyses: AnalysisItem[] = [];
  const rates = data.map(d => d.rate);
  const stdDev = calculateStandardDeviation(rates);
  const rateRange = maxRate - Math.min(...rates);

  if (stdDev > averageRate * 0.2) {
    analyses.push({
      type: 'warning',
      message: 'Your polling rate shows significant fluctuations. This might indicate interference or connection issues.'
    });
  } else {
    analyses.push({
      type: 'success',
      message: 'Your polling rate is stable, indicating a good connection and proper mouse function.'
    });
  }

  if (averageRate < 500) {
    analyses.push({
      type: 'info',
      message: `Average rate of ${Math.round(averageRate)}Hz is typical for standard mice. For gaming, consider a mouse with a higher polling rate.`
    });
  } else if (averageRate >= 500 && averageRate < 900) {
    analyses.push({
      type: 'success',
      message: `Your average rate of ${Math.round(averageRate)}Hz is good for gaming and most applications.`
    });
  }

  if (rateRange > averageRate * 0.5) {
    analyses.push({
      type: 'warning',
      message: `Large variation in polling rate (${Math.round(rateRange)}Hz range). Try testing on different USB ports or surfaces.`
    });
  }

  return analyses;
}

function calculateStandardDeviation(numbers: number[]): number {
  const mean = numbers.reduce((acc, val) => acc + val, 0) / numbers.length;
  const squareDiffs = numbers.map(value => Math.pow(value - mean, 2));
  const avgSquareDiff = squareDiffs.reduce((acc, val) => acc + val, 0) / squareDiffs.length;
  return Math.sqrt(avgSquareDiff);
}