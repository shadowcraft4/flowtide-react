/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Flowtide palette. Mirrored as CSS variables in index.css for the hand-written effects.
        ink: '#07060b',
        card: '#15131d',
        card2: '#1c1a27',
        fg: '#f4f2f8',
        muted: '#9893a8',
        'muted-soft': '#716d82',
        accent: '#8b5cf6',
        'accent-deep': '#6d35e0',
        'accent-soft': '#c9b8ff',
        warm: '#ff9d6c',
        good: '#5fd0a3',
        danger: '#f2897e',
        line: 'rgba(255,255,255,.08)',
        'line-strong': 'rgba(255,255,255,.14)',
        glass: 'rgba(21,19,29,.58)',
        'glass-strong': 'rgba(26,23,36,.82)',
      },
      fontFamily: {
        display: ['"Clash Display"', 'Satoshi', 'sans-serif'],
        sans: ['Satoshi', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        tile: '12px',
        panel: '18px',
        card: '24px',
      },
      boxShadow: {
        card: '0 24px 60px -24px rgba(0,0,0,.65), inset 0 1px 0 rgba(255,255,255,.04)',
        pop: '0 20px 50px -14px rgba(0,0,0,.55)',
        glow: '0 0 1px rgba(139,92,246,.4), 0 18px 40px -12px rgba(139,92,246,.55)',
        chip: '0 6px 18px -6px rgba(139,92,246,.55)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(.16,1,.3,1)',
      },
      keyframes: {
        // Required by Aceternity's Aurora Background.
        aurora: {
          from: { backgroundPosition: '50% 50%, 50% 50%' },
          to: { backgroundPosition: '350% 50%, 350% 50%' },
        },
        'rise-in': {
          from: { opacity: '0', transform: 'translateY(14px)' },
          to: { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        aurora: 'aurora 60s linear infinite',
        'rise-in': 'rise-in .42s cubic-bezier(.16,1,.3,1) both',
      },
    },
  },
  plugins: [],
};
