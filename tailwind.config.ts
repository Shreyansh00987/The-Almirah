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
        parchment: {
          50: "#FCFAF6",
          100: "#F7F5EF",
          200: "#EFECE3",
          300: "#E2DDD3",
          400: "#CFC7BA",
          500: "#B8AF9E",
          ink: "#1C1917",
          subtle: "#78716C",
        },
        walnut: {
          950: "#27150B",
          900: "#3E2414",
          800: "#4D2E1A",
          700: "#5A3822",
          600: "#6B4A33",
          500: "#83593B",
          400: "#9D704E",
          300: "#BC906F",
          200: "#DCBAA0",
          100: "#F1E2D6",
          50: "#FAF3ED",
        },
        brass: {
          DEFAULT: "#B48226",
          light: "#D4AF37",
          dark: "#8C631B",
          subtle: "#FDF6E2",
        },
        paper: {
          light: "#FFFFFF",
          DEFAULT: "#FBF9F5",
          dark: "#F3EFE6",
          ink: "#1C1917",
          muted: "#665E55",
        },
        amber: {
          glow: "#D97706",
          subtle: "#FEF3C7",
        },
        signal: {
          red: "#DC2626",
          glow: "#FEE2E2",
        },
        emerald: {
          calm: "#059669",
          subtle: "#ECFDF5",
        },
      },
      fontFamily: {
        serif: ["var(--font-source-serif)", "Source Serif 4", "Georgia", "serif"],
        sans: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
      },
      boxShadow: {
        'drawer-calm': "0 2px 10px rgba(5, 150, 105, 0.12)",
        'drawer-amber': "0 4px 18px rgba(217, 119, 6, 0.25)",
        'drawer-red': "0 6px 24px rgba(220, 38, 38, 0.3)",
        'paper-edge': "0 4px 20px -2px rgba(44, 34, 24, 0.08), 0 0 0 1px rgba(226, 221, 211, 0.8)",
        'warm-sm': "0 1px 2px rgba(44, 34, 24, 0.05)",
        'warm-md': "0 4px 12px rgba(44, 34, 24, 0.07)",
        'warm-xl': "0 12px 30px rgba(44, 34, 24, 0.12)",
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
