import type { Config } from "tailwindcss";
import { themePlugin } from "./src/styles/tailwind.plugin";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        primaryHover: "var(--color-primaryHover)",
        primarySoft: "var(--color-primarySoft)",
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        text: "var(--color-text)",
        secondary: "var(--color-secondary)",
        border: "var(--color-border)",
        muted: "var(--color-muted)",
        danger: "var(--color-danger)",
        dangerText: "var(--color-dangerText)",
        dangerSoft: "var(--color-dangerSoft)",
        success: "var(--color-success)",
        successSoft: "var(--color-successSoft)",
        warning: "var(--color-warning)",
        warningSoft: "var(--color-warningSoft)",
      },
    },
  },
  plugins: [themePlugin],
};

export default config;
