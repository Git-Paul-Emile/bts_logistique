import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'bts-blue': {
          DEFAULT: '#003366',
          50: '#edf4fb',
          100: '#d7e6f6',
          200: '#b4d1ee',
          300: '#86b6e4',
          400: '#5397d7',
          500: '#2d79c6',
          600: '#1c5faa',
          700: '#144b88',
          800: '#003366',
          900: '#00254c',
          950: '#001733',
        },
        'bts-green': {
          DEFAULT: '#058441',
          50: '#edfbf3',
          100: '#d4f6e2',
          200: '#a8edc6',
          300: '#6ee0a3',
          400: '#35cb7c',
          500: '#16b060',
          600: '#058441',
          700: '#067039',
          800: '#095930',
          900: '#09492a',
          950: '#022915',
        },
        'bts-dark': {
          DEFAULT: '#1d1d1b',
          surface: '#111b22',
          card: '#16232d',
          muted: '#64748b',
        },
        'bts-canvas': '#f6f8fa',
      },
      fontFamily: {
        display: ['Montserrat', 'DM Sans', 'sans-serif'],
        code: ['"IBM Plex Mono"', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
} satisfies Config;
