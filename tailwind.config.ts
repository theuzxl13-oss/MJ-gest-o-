import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    container: { center: true, padding: { DEFAULT: '1.25rem', lg: '2rem' }, screens: { '2xl': '1280px' } },
    extend: {
      colors: {
        forest: { DEFAULT: '#103B2B', 50: '#EEF3F0', 100: '#D5E2DA', 700: '#16483A', 800: '#103B2B', 900: '#0B2A1F' },
        brand: { DEFAULT: '#285943', light: '#3A7459' },
        gold: { DEFAULT: '#B69A5B', light: '#D4BF8E', dark: '#957C43' },
        offwhite: '#F7F6F2',
        graphite: '#252525',
      },
      fontFamily: {
        serif: ['var(--font-playfair)', 'Georgia', 'serif'],
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 10px 40px -12px rgba(16, 59, 43, 0.18)',
        card: '0 2px 10px -2px rgba(16, 59, 43, 0.08)',
      },
      maxWidth: { prose: '68ch' },
    },
  },
  plugins: [],
};

export default config;
