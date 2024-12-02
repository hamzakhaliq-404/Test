import { X, MousePointer, Zap, Cpu } from 'lucide-react';
import { useTheme } from '../contexts/ThemeProvider';

interface PerformanceGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PerformanceGuide({ isOpen, onClose }: PerformanceGuideProps) {
  const { theme } = useTheme();
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${
        theme === 'light' 
          ? 'bg-white shadow-xl' 
          : 'bg-slate-900/90'
        } rounded-xl w-full max-w-2xl mx-4 relative neon-border max-h-[80vh] flex flex-col`}>
        <div className={`p-6 border-b ${theme === 'light' ? 'border-slate-200' : 'border-slate-700'}`}>
          <h2 className={`text-2xl font-bold ${
            theme === 'light' ? 'text-slate-800' : 'neon-text'
          }`}>Understanding Mouse Polling Rates</h2>
          <button
            onClick={onClose}
            className={`absolute right-4 top-4 ${
              theme === 'light' 
                ? 'text-slate-600 hover:text-slate-900' 
                : 'text-slate-400 hover:text-white hover:neon-glow'
            } transition-all duration-300`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto custom-scrollbar">
          <div className="space-y-6">
            <section>
              <h3 className={`flex items-center gap-2 text-lg font-semibold mb-3 ${
                theme === 'light' ? 'text-blue-600' : 'text-cyan-400'
              }`}>
                <MousePointer className="w-5 h-5" />
                What is Polling Rate?
              </h3>
              <p className={theme === 'light' ? 'text-slate-700' : 'text-slate-300'}>
                Polling rate measures how often your mouse reports its position to your computer, expressed in Hertz (Hz). 
                A polling rate of 1000Hz means your mouse updates its position 1000 times per second.
              </p>
            </section>

            <section>
              <h3 className={`flex items-center gap-2 text-lg font-semibold mb-3 ${
                theme === 'light' ? 'text-purple-600' : 'text-fuchsia-400'
              }`}>
                <Zap className="w-5 h-5" />
                Performance Ratings
              </h3>
              <div className="space-y-3">
                <div className={`p-3 rounded-lg ${
                  theme === 'light' 
                    ? 'bg-slate-50 border border-slate-200' 
                    : 'bg-slate-800/50 border border-slate-700'
                }`}>
                  <div className="font-semibold text-green-600 dark:text-green-400 mb-1">High (1000Hz+)</div>
                  <p className={theme === 'light' ? 'text-slate-700' : 'text-slate-300'}>
                    Excellent for competitive gaming. Provides ultra-smooth cursor movement and minimal input lag.
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${
                  theme === 'light' 
                    ? 'bg-slate-50 border border-slate-200' 
                    : 'bg-slate-800/50 border border-slate-700'
                }`}>
                  <div className="font-semibold text-yellow-600 dark:text-yellow-400 mb-1">Medium (500-999Hz)</div>
                  <p className={theme === 'light' ? 'text-slate-700' : 'text-slate-300'}>
                    Good for casual gaming and everyday use. Offers responsive performance for most applications.
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${
                  theme === 'light' 
                    ? 'bg-slate-50 border border-slate-200' 
                    : 'bg-slate-800/50 border border-slate-700'
                }`}>
                  <div className="font-semibold text-red-600 dark:text-red-400 mb-1">Low (Below 500Hz)</div>
                  <p className={theme === 'light' ? 'text-slate-700' : 'text-slate-300'}>
                    Basic performance suitable for office work. May feel less smooth in fast-paced applications.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className={`flex items-center gap-2 text-lg font-semibold mb-3 ${
                theme === 'light' ? 'text-indigo-600' : 'text-violet-400'
              }`}>
                <Cpu className="w-5 h-5" />
                Optimization Tips
              </h3>
              <ul className={`space-y-2 ${theme === 'light' ? 'text-slate-700' : 'text-slate-300'}`}>
                <li>• Use a high-quality mouse pad for consistent tracking</li>
                <li>• Connect your mouse directly to your motherboard's USB ports</li>
                <li>• Keep your mouse drivers up to date</li>
                <li>• Clean your mouse sensor regularly</li>
                <li>• Consider mice with higher polling rate capabilities for competitive gaming</li>
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}