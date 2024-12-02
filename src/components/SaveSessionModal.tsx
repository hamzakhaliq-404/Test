import { X } from 'lucide-react';
import { useState, useCallback } from 'react';

interface SaveSessionModalProps {
  onSave: (username: string) => void;
  onClose: () => void;
  isOpen: boolean;
}

export function SaveSessionModal({ onSave, onClose, isOpen }: SaveSessionModalProps) {
  const [username, setUsername] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      const trimmedUsername = username.trim();
      
      if (!trimmedUsername) {
        setError('Username is required');
        return;
      }
      
      if (trimmedUsername.length < 3) {
        setError('Username must be at least 3 characters');
        return;
      }
      
      if (trimmedUsername.length > 20) {
        setError('Username must be less than 20 characters');
        return;
      }

      onSave(trimmedUsername);
      setUsername('');
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while saving');
    } finally {
      setIsSubmitting(false);
    }
  }, [username, onSave]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-900/90 rounded-xl p-6 w-full max-w-md mx-4 relative neon-border">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white hover:neon-glow transition-all duration-300"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-xl font-bold mb-4 neon-text">Save Your Results</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="username" className="block text-sm text-slate-400 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError(null);
              }}
              className="input-gaming w-full"
              placeholder="Enter your username"
              maxLength={20}
              required
              disabled={isSubmitting}
            />
            {error && (
              <p className="text-red-400 text-sm mt-1">{error}</p>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Results'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}