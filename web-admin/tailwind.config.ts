import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#0b0d12',
        surface: '#141821',
        surfaceMuted: '#1b202c',
        border: '#2a3040',
        primary: '#4f7cff',
        danger: '#e5484d',
        textMuted: '#8b93a7',
      },
    },
  },
  plugins: [],
};

export default config;
