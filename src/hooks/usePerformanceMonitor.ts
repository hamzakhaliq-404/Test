import { useEffect, useRef } from 'react';

interface PerformanceMetrics {
  fps: number;
  memory?: {
    usedJSHeapSize: number;
    totalJSHeapSize: number;
  };
}

export function usePerformanceMonitor(
  onMetricsUpdate?: (metrics: PerformanceMetrics) => void,
  interval = 1000
) {
  const frameCount = useRef(0);
  const lastTime = useRef(performance.now());
  const animationFrameId = useRef<number>();
  const intervalIdRef = useRef<NodeJS.Timer>();
  const isActive = useRef(true);

  useEffect(() => {
    const measure = () => {
      if (!isActive.current) return;
      
      frameCount.current++;
      animationFrameId.current = requestAnimationFrame(measure);
    };

    const reportMetrics = () => {
      if (!isActive.current) return;

      const currentTime = performance.now();
      const elapsed = currentTime - lastTime.current;
      
      // Ensure we don't divide by zero and have reasonable elapsed time
      if (elapsed > 0 && elapsed <= interval * 1.5) {
        const fps = Math.round((frameCount.current / elapsed) * 1000);

        const metrics: PerformanceMetrics = {
          fps: Math.min(Math.max(fps, 0), 144), // Cap FPS at reasonable values
        };

        // Only include memory metrics if available and reasonable
        if (window.performance && (performance as any).memory) {
          const memory = (performance as any).memory;
          if (memory.usedJSHeapSize <= memory.totalJSHeapSize) {
            metrics.memory = {
              usedJSHeapSize: memory.usedJSHeapSize,
              totalJSHeapSize: memory.totalJSHeapSize,
            };
          }
        }

        if (onMetricsUpdate) {
          onMetricsUpdate(metrics);
        }
      }

      frameCount.current = 0;
      lastTime.current = currentTime;
    };

    animationFrameId.current = requestAnimationFrame(measure);
    intervalIdRef.current = setInterval(reportMetrics, interval);

    return () => {
      isActive.current = false;
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (intervalIdRef.current) {
        clearInterval(intervalIdRef.current);
      }
    };
  }, [onMetricsUpdate, interval]);
}