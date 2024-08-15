import { createThemes } from "tw-colors";

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        inter: ["'Inter'", "sans-serif"],
        gelasio: ["'Gelasio'", "serif"],
        sohne: ["sohne", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
      },

      fontSize: {
        sm: "12px",
        base: "14px",
        xl: "16px",
        "2xl": "20px",
        "3xl": "28px",
        "4xl": "38px",
        "5xl": "50px",
      },

      textColor: {
        twitter: "#1DA1F2",
        facebook: "#4267B2",
        youtube: "#ff0000",
        github: "#24292f",
        instagram: "#fc0068",
        website: "#68e5f4",
      },

      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },

      animation: {
        blink: "blink 2s ease-in-out infinite",
      },
    },
  },
  variants: {},
  plugins: [
    createThemes(
      {
        light: {
          white: {
            custom: "#FFFFFF",
          },
          black: {
            custom: "#242424",
          },
          grey: {
            custom: "#F3F3F3",
            dark: "#6B6B6B",
            placeholder: "#A9A9AC",
            index: "#e5e7eb",
          },
          red: {
            custom: "#FF4E4E",
          },
          purple: {
            custom: "#8B46FF",
          },
          yellow: {
            mark: "#FFD700",
          },
          blue: {
            custom: "#62b3ed",
          },
        },
        dark: {
          white: {
            custom: "#242424",
          },
          black: {
            custom: "#F3F3F3",
          },
          grey: {
            custom: "#2A2A2A",
            dark: "#E7E7E7",
            placeholder: "#A9A9AC",
            index: "#99999930",
          },
          red: {
            custom: "#FF4E4E",
          },
          purple: {
            custom: "#c084fc",
          },
          blue: {
            custom: "#62b3ed",
          },
        },
      },
      { strict: true }
    ),
  ],
};
