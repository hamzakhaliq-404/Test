import { Monitor, Moon, Sun, Eye } from 'lucide-react';
import { useTheme } from '../contexts/ThemeProvider';
import { useState, useRef, useEffect } from 'react';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const themes = [
    { id: 'light' as const, icon: Sun, label: 'Light' },
    { id: 'dark' as const, icon: Moon, label: 'Dark' },
    { id: 'high-contrast' as const, icon: Eye, label: 'High Contrast' },
  ];

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg transition"
        style={{
          backgroundColor: 'var(--background-elevated)',
          color: 'var(--text-primary)',
        }}
        aria-label="Toggle theme"
      >
        <Monitor className="w-5 h-5" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-48 rounded-lg shadow-lg theme-switcher-popup"
             style={{
               backgroundColor: 'var(--background-elevated)',
               borderColor: 'var(--border-color)',
               borderWidth: '1px',
             }}>
          {themes.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => {
                setTheme(id);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-4 py-2 text-left transition"
              style={{
                color: theme === id ? 'var(--text-accent)' : 'var(--text-primary)',
                backgroundColor: 'var(--background-elevated)',
              }}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}