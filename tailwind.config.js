/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light theme colors - updated for better contrast and harmony
        light: {
          bg: {
            primary: '#ffffff',
            secondary: '#f8fafc',
            elevated: '#f3f4f6',
          },
          text: {
            primary: '#1e293b',
            secondary: '#475569',
            accent: '#3b82f6',
          },
          border: '#e2e8f0',
        },
        // Dark theme colors (unchanged)
        dark: {
          bg: {
            primary: '#0a0a0f',
            secondary: '#12121a',
            elevated: '#1a1a24',
          },
          text: {
            primary: '#f8fafc',
            secondary: '#94a3b8',
            accent: '#60a5fa',
          },
          border: '#2a2a35',
        },
        // High contrast theme colors (unchanged)
        'high-contrast': {
          bg: {
            primary: '#000000',
            secondary: '#0a0a0a',
            elevated: '#141414',
          },
          text: {
            primary: '#ffffff',
            secondary: '#00ff00',
            accent: '#ffff00',
          },
          border: '#00ff00',
        },
      },
      animation: {
        'glow': 'glow 2s ease-in-out infinite alternate',
        'flow': 'flow 4s linear infinite',
      },
      keyframes: {
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 243, 255, 0.5), 0 0 10px rgba(0, 243, 255, 0.3)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 243, 255, 0.8), 0 0 30px rgba(0, 243, 255, 0.6)' },
        },
        flow: {
          '0%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
          '100%': { backgroundPosition: '0% 50%' },
        },
      },
    },
  },
  plugins: [],
}