import { useState, useCallback, useEffect, useRef } from 'react';
import { usePerformanceMonitor } from '../hooks/usePerformanceMonitor';
import { sanitizeNumber } from '../utils/validation';
import { useTheme } from '../contexts/ThemeProvider';
import { MousePointer } from 'lucide-react';

interface TestAreaProps {
  onPollingUpdate: (rate: number) => void;
  isTracking: boolean;
}

interface MovementSample {
  timestamp: number;
  x: number;
  y: number;
}

const SAMPLE_WINDOW = 100; // 100ms window for calculations
const MIN_SAMPLES = 5;
const UPDATE_INTERVAL = 16; // ~60fps update rate
const MIN_MOVEMENT_THRESHOLD = 1; // Minimum pixel movement to count as valid

export function TestArea({ onPollingUpdate, isTracking }: TestAreaProps) {
  const { theme } = useTheme();
  const [performanceWarning, setPerformanceWarning] = useState(false);
  const [movementQuality, setMovementQuality] = useState<'good' | 'slow' | 'none'>('none');
  const samples = useRef<MovementSample[]>([]);
  const lastPosition = useRef<{ x: number; y: number } | null>(null);
  const frameId = useRef<number>();
  const lastUpdate = useRef<number>(0);
  const areaRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<HTMLCanvasElement>(null);

  // Performance monitoring
  usePerformanceMonitor(
    useCallback((metrics) => {
      setPerformanceWarning(metrics.fps < 30);
    }, []),
    1000
  );

  // Particle effect
  useEffect(() => {
    if (!particlesRef.current || !isTracking) return;

    const canvas = particlesRef.current;
    const ctx = canvas.getContext('2d')!;
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
    }> = [];

    const createParticle = (x: number, y: number) => {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 2 + 1;
      particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
      });
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= 0.02;
        if (p.life <= 0) {
          particles.splice(i, 1);
          continue;
        }

        p.x += p.vx;
        p.y += p.vy;
        
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 243, 255, ${p.life * 0.5})`;
        ctx.fill();
      }

      requestAnimationFrame(animate);
    };

    const resizeCanvas = () => {
      if (canvas && canvas.parentElement) {
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    animate();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [isTracking]);

  useEffect(() => {
    if (!isTracking) {
      samples.current = [];
      lastPosition.current = null;
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
      setMovementQuality('none');
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      const currentPosition = { x: e.clientX, y: e.clientY };

      // Add particles on movement
      if (particlesRef.current) {
        const rect = particlesRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        for (let i = 0; i < 2; i++) {
          createParticle(x, y);
        }
      }

      if (lastPosition.current) {
        const dx = currentPosition.x - lastPosition.current.x;
        const dy = currentPosition.y - lastPosition.current.y;
        const movement = Math.sqrt(dx * dx + dy * dy);

        if (movement >= MIN_MOVEMENT_THRESHOLD) {
          samples.current.push({
            timestamp: now,
            x: currentPosition.x,
            y: currentPosition.y
          });
        }
      }

      lastPosition.current = currentPosition;
    };

    const processFrame = () => {
      const now = performance.now();
      if (now - lastUpdate.current >= UPDATE_INTERVAL) {
        // Remove old samples
        const cutoff = now - SAMPLE_WINDOW;
        samples.current = samples.current.filter(s => s.timestamp >= cutoff);

        if (samples.current.length >= MIN_SAMPLES) {
          // Calculate instantaneous rates between consecutive samples
          const rates: number[] = [];
          for (let i = 1; i < samples.current.length; i++) {
            const timeDiff = samples.current[i].timestamp - samples.current[i - 1].timestamp;
            if (timeDiff > 0) {
              const rate = 1000 / timeDiff;
              rates.push(rate);
            }
          }

          // Calculate the median rate (more robust than mean)
          rates.sort((a, b) => a - b);
          const medianRate = rates[Math.floor(rates.length / 2)];
          
          // Update movement quality indicator
          setMovementQuality(rates.length > 10 ? 'good' : 'slow');
          
          // Only update if we have a reasonable rate
          if (medianRate >= 60 && medianRate <= 4000) {
            onPollingUpdate(sanitizeNumber(medianRate));
          }
        } else {
          setMovementQuality('slow');
        }

        lastUpdate.current = now;
      }

      frameId.current = requestAnimationFrame(processFrame);
    };

    if (areaRef.current) {
      areaRef.current.addEventListener('mousemove', handleMouseMove);
      frameId.current = requestAnimationFrame(processFrame);
    }

    return () => {
      if (areaRef.current) {
        areaRef.current.removeEventListener('mousemove', handleMouseMove);
      }
      if (frameId.current) {
        cancelAnimationFrame(frameId.current);
      }
    };
  }, [isTracking, onPollingUpdate]);

  return (
    <div className="space-y-4">
      {performanceWarning && (
        <div className="text-amber-400 text-sm flex items-center gap-2 p-3 rounded-lg border border-amber-500/20 bg-amber-500/10">
          <span>⚠️</span>
          Low system performance detected. Results may be affected.
        </div>
      )}

      <div className="relative">
        <div 
          ref={areaRef}
          className={`test-area relative w-full h-[300px] rounded-xl overflow-hidden transition-all duration-200
            ${theme === 'light' 
              ? 'bg-slate-100/50 border-slate-200/50' 
              : 'bg-slate-800/50 border-slate-700/50'}`}
        >
          <canvas
            ref={particlesRef}
            className="absolute inset-0 pointer-events-none"
          />
          
          {isTracking && (
            <div className="absolute inset-0 pointer-events-none">
              <div className={`absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2
                transition-opacity duration-300 ${movementQuality === 'none' ? 'opacity-100' : 'opacity-0'}`}>
                <div className="w-32 h-32 rounded-full border-2 border-dashed animate-spin"
                     style={{ borderColor: 'var(--text-accent)' }} />
              </div>
            </div>
          )}

          <div className="absolute inset-0 grid place-items-center pointer-events-none">
            {isTracking ? (
              <div className={`text-center transition-opacity duration-300 
                ${movementQuality === 'none' ? 'opacity-100' : 'opacity-0'}`}>
                <MousePointer className="w-6 h-6 mb-2 mx-auto" style={{ color: 'var(--text-accent)' }} />
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  Move your mouse in circles
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Keep moving smoothly for accurate results
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="font-medium" style={{ color: 'var(--text-primary)' }}>
                  Click Start to begin testing
                </p>
                <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                  Make sure no other programs are using heavy CPU
                </p>
              </div>
            )}
          </div>

          {isTracking && movementQuality !== 'none' && (
            <div className={`absolute bottom-4 left-1/2 transform -translate-x-1/2 px-4 py-2 rounded-full
              transition-all duration-300 ${
                movementQuality === 'good' 
                  ? 'bg-green-500/20 text-green-400 border-green-500/30'
                  : 'bg-amber-500/20 text-amber-400 border-amber-500/30'
              } border`}>
              {movementQuality === 'good' ? 'Good movement!' : 'Move faster...'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function createParticle(x: number, y: number) {
  const angle = Math.random() * Math.PI * 2;
  const speed = Math.random() * 2 + 1;
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    life: 1,
  };
}