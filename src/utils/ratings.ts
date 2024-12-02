import { useTheme } from '../contexts/ThemeProvider';

interface RatingInfo {
  message: string;
  color: string;
}

export function getRatingInfo(pollingRate: number): RatingInfo {
  if (pollingRate >= 1000) {
    return {
      message: "Excellent! Your device is performing at top speed.",
      color: "text-emerald-600 dark:text-green-400"
    };
  } else if (pollingRate >= 500) {
    return {
      message: "Good. Your device is responsive.",
      color: "text-amber-600 dark:text-yellow-400"
    };
  } else {
    return {
      message: "Consider upgrading for better performance.",
      color: "text-red-600 dark:text-red-400"
    };
  }
}