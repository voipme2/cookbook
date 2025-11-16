import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Dark mode specific colors
        dark: {
          bg: "#0f172a",
          surface: "#1e293b",
          border: "#334155",
          text: "#f1f5f9",
          "text-secondary": "#cbd5e1",
        },
      },
    },
  },
  plugins: [],
} satisfies Config;

