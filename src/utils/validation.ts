import type { LeaderboardEntry } from '../types/user';

export const sanitizeNumber = (num: number): number => {
  if (!Number.isFinite(num) || Number.isNaN(num)) return 0;
  
  // Common polling rate values
  const commonRates = [125, 250, 500, 1000, 2000, 4000, 8000];
  
  // If the value is unreasonably low or high, return 0
  if (num < 60 || num > 8000) return 0;
  
  // Find the closest common polling rate
  const closest = commonRates.reduce((prev, curr) => {
    return Math.abs(curr - num) < Math.abs(prev - num) ? curr : prev;
  });
  
  // If within 15% of a common rate, snap to it
  if (Math.abs(num - closest) / closest < 0.15) {
    return closest;
  }
  
  // Otherwise return the rounded value
  return Math.round(num);
};

export const safeLocalStorage = {
  isAvailable(): boolean {
    try {
      const testKey = '_test_' + Math.random();
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  },

  getJSON<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  setJSON(key: string, value: any): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }
};

export const validatePollingData = (data: { rate: number; timestamp: number }[]): string | null => {
  if (!Array.isArray(data)) {
    return 'Invalid data format';
  }

  if (data.length === 0) {
    return 'No data to save';
  }

  if (data.length < 10) {
    return 'Not enough data points for accurate results';
  }

  const rates = data.map(d => d.rate);
  const avg = rates.reduce((a, b) => a + b, 0) / rates.length;

  if (avg < 60 || avg > 8000) {
    return 'Invalid polling rate values detected';
  }

  return null;
};