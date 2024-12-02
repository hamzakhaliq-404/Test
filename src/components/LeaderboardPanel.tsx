import { Trophy, Medal, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { safeLocalStorage } from '../utils/validation';
import { formatDistanceToNow } from 'date-fns';
import type { LeaderboardEntry } from '../types/user';

export function LeaderboardPanel() {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLeaderboard = () => {
      try {
        const data = safeLocalStorage.getJSON<LeaderboardEntry[]>('globalLeaderboard', []);
        const sortedData = data
          .sort((a, b) => b.maxRate - a.maxRate)
          .slice(0, 10);
          
        setLeaderboardData(sortedData);
      } catch (err) {
        setError('Unable to load leaderboard data');
        console.error('Error loading leaderboard:', err);
      }
    };

    loadLeaderboard();
    const interval = setInterval(loadLeaderboard, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="card z-0">
      <div className="flex items-center gap-2 mb-4">
        <Trophy className="w-5 h-5" style={{ color: 'var(--text-accent)' }} />
        <h3 className="text-lg font-semibold neon-text">Global Leaderboard</h3>
      </div>
      
      {error ? (
        <p style={{ color: 'var(--neon-secondary)' }} className="text-center py-4">{error}</p>
      ) : (
        <div className="space-y-2">
          {leaderboardData.length === 0 ? (
            <p className="text-center py-4" style={{ color: 'var(--text-secondary)' }}>
              No entries yet. Be the first to submit your results!
            </p>
          ) : (
            leaderboardData.map((entry, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg gaming-gradient hover:neon-glow transition-all duration-300"
              >
                <div className={`flex items-center justify-center w-8 h-8 rounded-full`}
                     style={{
                       backgroundColor: index === 0 ? 'color-mix(in srgb, var(--neon-primary) 20%, transparent)' :
                                      index === 1 ? 'color-mix(in srgb, var(--neon-secondary) 20%, transparent)' :
                                      index === 2 ? 'color-mix(in srgb, var(--neon-accent) 20%, transparent)' :
                                      'color-mix(in srgb, var(--text-secondary) 20%, transparent)',
                       color: index === 0 ? 'var(--neon-primary)' :
                              index === 1 ? 'var(--neon-secondary)' :
                              index === 2 ? 'var(--neon-accent)' :
                              'var(--text-secondary)'
                     }}>
                  {index === 0 ? <Medal className="w-4 h-4" /> :
                   index === 1 ? <Medal className="w-4 h-4" /> :
                   index === 2 ? <Medal className="w-4 h-4" /> :
                   index + 1}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium" style={{ color: 'var(--text-primary)' }}>
                      {entry.username}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(entry.date), { addSuffix: true })}
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold neon-text">
                    {entry.maxRate} Hz
                  </div>
                  <div className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                    avg: {entry.averageRate} Hz
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}