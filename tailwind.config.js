/** @type {import('tailwindcss').Config} */
// Every colour reads a CSS variable set by the active vibe (see VIBES and applyVibeTokens
// in src/lib/constants.js), so switching vibes recolours the whole app at once.
const v = name => `rgb(var(--${name}) / <alpha-value>)`;

export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: v('base'),
        surface: v('surface'),
        fg: v('ink'),
        muted: 'rgb(var(--ink) / .7)',
        'muted-soft': 'rgb(var(--ink) / .5)',
        accent: v('accent'),
        'accent-ink': v('accent-ink'),
        warm: '#ff9d6c',
        good: '#5fd0a3',
        danger: '#f2897e',
        line: 'rgb(var(--ink) / .14)',
        'line-strong': 'rgb(var(--ink) / .24)',
        glass: 'rgb(var(--glass) / var(--glass-a))',
        'glass-strong': 'rgb(var(--glass) / var(--glass-strong-a))',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['"Bricolage Grotesque"', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        tile: '12px',
        panel: '18px',
        card: '22px',
      },
      boxShadow: {
        card: '0 24px 60px -28px rgba(0,0,0,.45)',
        pop: '0 20px 50px -14px rgba(0,0,0,.45)',
        glow: '0 10px 30px -10px rgb(var(--accent) / .9)',
        chip: '0 6px 18px -6px rgb(var(--accent) / .7)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(.16,1,.3,1)',
      },
      keyframes: {
        bob: {
          '0%, 100%': { transform: 'rotate(8deg) translateY(0)' },
          '50%': { transform: 'rotate(5deg) translateY(-4px)' },
        },
        eq: { to: { height: '100%' } },
      },
      animation: {
        bob: 'bob 4s ease-in-out infinite',
        eq: 'eq 1.1s ease-in-out infinite alternate',
      },
    },
  },
  plugins: [],
};
