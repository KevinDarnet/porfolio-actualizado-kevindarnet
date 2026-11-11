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
        background: {
          primary: '#0d0d0d',
          secondary: '#121212',
          surface: '#1a1a1a',
          card: '#1e1e1e',
          elevated: '#242424',
        },
        text: {
          primary: '#F5F5F5',
          secondary: '#A0A0A0',
          muted: '#888888',
        },
        border: {
          subtle: '#262626',
          DEFAULT: '#333333',
          hover: '#525252',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Open Sans', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'monospace'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      },
    },
  },
  plugins: [],
};
