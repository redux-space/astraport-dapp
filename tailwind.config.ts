import type { Config } from 'tailwindcss';
import defaultTheme from 'tailwindcss/defaultTheme';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      colors: {
        stellar: {
          50: '#e6f7f5',
          100: '#b2eae5',
          300: '#4cd9cc',
          400: '#2dd0bf',
          500: '#12C6B2', // Your teal brand color
          600: '#0F2747', // Your dark navy brand color
          700: '#0c1d36',
        },
        brand: {
          navy: '#0F2747',
          teal: '#12C6B2',
        },
      },
    },
  },
  plugins: [],
};

export default config;