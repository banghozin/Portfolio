import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: "#0B0E1A",
        surface: "#12162B",
        "surface-hover": "#1B2040",
        text: "#F2F0E9",
        "text-muted": "#8B90A8",
        gold: "#E8B95C",
        periwinkle: "#6C7BFF",
        line: "rgba(242,240,233,0.08)",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        body: ["var(--font-pretendard)", "sans-serif"],
        mono: ["var(--font-jbmono)", "monospace"],
      },
      backgroundImage: {
        "radial-fade":
          "radial-gradient(circle at center, rgba(232,185,92,0.08) 0%, rgba(11,14,26,0) 70%)",
      },
    },
  },
  plugins: [],
};
export default config;
