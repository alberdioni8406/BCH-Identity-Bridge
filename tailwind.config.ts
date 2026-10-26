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
        bch: {
          DEFAULT: "#0AC18E",
          50: "#E6F9F3",
          100: "#C2F0E2",
          200: "#8AE3C7",
          300: "#4DD4A8",
          400: "#1FC48F",
          500: "#0AC18E",
          600: "#089E74",
          700: "#067A5A",
          800: "#045740",
          900: "#033A2B",
        },
        pusd: {
          DEFAULT: "#8B5CF6",
          500: "#8B5CF6",
          600: "#7C3AED",
        },
        surface: {
          DEFAULT: "#0F1419",
          card: "#1A2332",
          elevated: "#243044",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        mono: ["JetBrains Mono", "Fira Code", "monospace"],
      },
    },
  },
  plugins: [],
};
export default config;
