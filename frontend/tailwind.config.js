/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          teal:    '#1a6b6b',
          tealDark:'#0f4444',
          tealLight:'#e8f5f5',
          gold:    '#c9973a',
          goldLight:'#f5edd6',
          cream:   '#faf6ee',
          maroon:  '#7b1d1d',
          dark:    '#0a2e2e',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body:    ['"DM Sans"', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        gold: '0 4px 24px rgba(201,151,58,0.18)',
        teal: '0 4px 24px rgba(26,107,107,0.18)',
        card: '0 2px 16px rgba(10,46,46,0.08)',
      },
    },
  },
  plugins: [],
};
