/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "bg-dark":    "#1A1A2E",
        "bg-dark-2":  "#202040",
        "bg-dark-3":  "#252550",
        "bg-light":   "#F5F5FF",
        "bg-light-2": "#FFFFFF",
        "bg-light-3": "#EEEEFF",
        "accent":     "#6366F1",
        "border-dark":  "#2E2E5E",
        "border-light": "#DDDDF0",
      },
      animation: {
        "fade-up":     "fadeUp 0.4s ease-out",
        "fade-in":     "fadeUp 0.4s ease-out both",
        "pulse-soft":  "pulseSoft 2s infinite",
        "bounce-dot":  "bounceDot 1.4s infinite ease-in-out both",
      },
      keyframes: {
        fadeUp: {
          "0%":   { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%":      { opacity: "0.7" },
        },
        bounceDot: {
          "0%, 80%, 100%": { transform: "scale(0)" },
          "40%":           { transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};
