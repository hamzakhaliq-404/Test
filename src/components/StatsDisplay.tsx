import { Activity, Gauge, Zap, HelpCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { PerformanceGuide } from './PerformanceGuide';
import { getRatingInfo } from '../utils/ratings';
import { useTheme } from '../contexts/ThemeProvider';

interface StatsDisplayProps {
  currentRate: number;
  averageRate: number;
  maxRate: number;
}

export function StatsDisplay({ currentRate, averageRate, maxRate }: StatsDisplayProps) {
  const { theme } = useTheme();
  const [isGuideOpen, setIsGuideOpen] = useState(false);
  const [animatedCurrent, setAnimatedCurrent] = useState(currentRate);
  const [animatedAverage, setAnimatedAverage] = useState(averageRate);
  const [animatedMax, setAnimatedMax] = useState(maxRate);

  useEffect(() => {
    const duration = 500; // Animation duration in ms
    const steps = 20; // Number of steps in the animation
    const startTime = performance.now();
    
    const animate = (start: number, target: number, setValue: (value: number) => void) => {
      const diff = target - start;
      
      const step = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const eased = 1 - Math.pow(1 - progress, 3);
        setValue(start + diff * eased);
        
        if (progress < 1) {
          requestAnimationFrame(step);
        }
      };
      
      requestAnimationFrame(step);
    };

    animate(animatedCurrent, currentRate, setAnimatedCurrent);
    animate(animatedAverage, averageRate, setAnimatedAverage);
    animate(animatedMax, maxRate, setAnimatedMax);
  }, [currentRate, averageRate, maxRate]);

  const { message, color } = getRatingInfo(animatedAverage);

  return (
    <>
      <div className="space-y-4">
        <div className="grid grid-cols-3 gap-4">
          <StatCard
            icon={<Activity />}
            label="Current"
            value={animatedCurrent}
            color="text-cyan-400"
            trend={currentRate > averageRate ? 'up' : currentRate < averageRate ? 'down' : 'neutral'}
          />
          <StatCard
            icon={<Gauge />}
            label="Average"
            value={animatedAverage}
            color="text-fuchsia-400"
            trend="neutral"
          />
          <StatCard
            icon={<Zap />}
            label="Maximum"
            value={animatedMax}
            color="text-violet-400"
            trend={maxRate === Math.max(currentRate, averageRate, maxRate) ? 'up' : 'neutral'}
          />
        </div>

        <div className={`flex items-center justify-between p-4 rounded-lg border backdrop-blur-sm
          ${theme === 'light' 
            ? 'bg-slate-50/90 border-slate-200' 
            : 'bg-slate-800/50 border-slate-700'}`}>
          <div className={`flex items-center gap-2 ${color}`}>
            <div className="w-2 h-2 rounded-full bg-current animate-pulse" />
            {message}
          </div>
          <button
            onClick={() => setIsGuideOpen(true)}
            className={`flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg transition-all
              ${theme === 'light'
                ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                : 'bg-slate-700 hover:bg-slate-600 text-slate-200'}`}
          >
            <HelpCircle className="w-4 h-4" />
            Learn More
          </button>
        </div>
      </div>

      <PerformanceGuide isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
    </>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
  trend: 'up' | 'down' | 'neutral';
}

function StatCard({ icon, label, value, color, trend }: StatCardProps) {
  const { theme } = useTheme();
  
  return (
    <div className={`relative overflow-hidden p-4 rounded-lg border transition-all duration-200
      ${theme === 'light'
        ? 'bg-white/50 border-slate-200 hover:bg-white'
        : 'bg-slate-800/50 border-slate-700 hover:bg-slate-800/70'}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className={color}>{icon}</span>
        <span className={theme === 'light' ? 'text-slate-600' : 'text-slate-400'}>
          {label}
        </span>
      </div>
      
      <div className="flex items-baseline gap-1">
        <div className={`text-2xl font-bold ${
          theme === 'light' ? 'text-slate-900' : 'text-white'
        }`}>
          {Math.round(value)}
        </div>
        <div className={`text-sm ${
          theme === 'light' ? 'text-slate-500' : 'text-slate-400'
        }`}>
          Hz
        </div>
      </div>

      {trend !== 'neutral' && (
        <div className={`absolute bottom-0 right-0 w-16 h-16 -mr-4 -mb-4 opacity-10
          transform ${trend === 'up' ? 'rotate-45' : '-rotate-45'}`}>
          <div className={`w-full h-full ${color}`} style={{
            backgroundImage: 'linear-gradient(45deg, transparent 50%, currentColor 50%)'
          }} />
        </div>
      )}
    </div>
  );
}