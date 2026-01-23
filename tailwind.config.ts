import type { Config } from "tailwindcss";
import { themePlugin } from "./src/shared/styles/tailwind.plugin";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        primary: "var(--color-primary)",
        primaryHover: "var(--color-primaryHover)",
        primarySoft: "var(--color-primarySoft)",
        onPrimary: "var(--color-onPrimary)",
        onPrimaryMuted: "var(--color-onPrimaryMuted)",
        onPrimarySoft: "var(--color-onPrimarySoft)",
        overlay: "var(--color-overlay)",
        background: "var(--color-background)",
        surface: "var(--color-surface)",
        card: "var(--color-card)",
        text: "var(--color-text)",
        secondary: "var(--color-secondary)",
        border: "var(--color-border)",
        muted: "var(--color-muted)",
        danger: "var(--color-danger)",
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
