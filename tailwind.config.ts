import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        slate: {
          950: "#0D0F13",
          900: "#12151A",
          850: "#171B21",
          800: "#1B2028",
          700: "#242A35",
          600: "#2E3644",
          500: "#455064",
          400: "#6B7A94",
          300: "#9AA6BA",
          200: "#CAD2DF",
          100: "#E6EAEE",
        },
        walnut: {
          900: "#2E1F15",
          800: "#4A3323",
          700: "#5D3F2B",
          600: "#6B4A33",
          500: "#8B6143",
          400: "#AB7E5B",
          300: "#CB9F7D",
          200: "#E3C3AA",
          100: "#F4E6DC",
        },
        brass: {
          DEFAULT: "#C8A265",
          light: "#E5C388",
          dark: "#A38044",
        },
        paper: {
          light: "#FBF9F5",
          DEFAULT: "#F1ECE2",
          dark: "#E5DEC9",
          ink: "#1F242C",
          muted: "#545D6E",
        },
        amber: {
          glow: "#E0A13A",
          subtle: "#F59E0B22",
        },
        signal: {
          red: "#C8453B",
          glow: "#C8453B33",
        },
      },
      fontFamily: {
        serif: ["var(--font-source-serif)", "Source Serif 4", "Georgia", "serif"],
        sans: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      boxShadow: {
        'drawer-calm': "0 0 15px -3px rgba(90, 103, 125, 0.15)",
        'drawer-amber': "0 0 25px 2px rgba(224, 161, 58, 0.35)",
        'drawer-red': "0 0 30px 4px rgba(200, 69, 59, 0.45)",
        'paper-edge': "0 4px 20px -2px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05)",
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '0.9', transform: 'scale(1)' },
          '50%': { opacity: '0.6', transform: 'scale(0.995)' },
        },
        scannerSweep: {
          '0%': { top: '0%', opacity: '0' },
          '15%': { opacity: '1' },
          '85%': { opacity: '1' },
          '100%': { top: '100%', opacity: '0' },
        },
      },
      animation: {
        'pulse-glow': 'pulseGlow 2.8s ease-in-out infinite',
        'scanner-sweep': 'scannerSweep 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
