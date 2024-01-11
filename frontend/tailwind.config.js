/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      fontFamily: {
        inter: ["'Inter'", 'sans-serif'],
        gelasio: ["'Gelasio'", 'serif'],
      },
      colors: {
        white: {
          custom: '#FFFFFF',
        },
        black: {
          custom: '#242424',
        },
        grey: {
          custom: '#F3F3F3',
          dark: '#6B6B6B',
          placeholder: '#A9A9AC',
        },
        red: {
          custom: '#FF4E4E',
        },
        purple: {
          custom: '#8B46FF',
        },
        twitter: '#1DA1F2',
      },

      fontSize: {
        sm: '12px',
        base: '14px',
        xl: '16px',
        '2xl': '20px',
        '3xl': '28px',
        '4xl': '38px',
        '5xl': '50px',
      },
    },
  },
  variants: {},
  plugins: [],
};
