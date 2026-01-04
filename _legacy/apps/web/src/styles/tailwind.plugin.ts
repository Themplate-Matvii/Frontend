import plugin from "tailwindcss/plugin";
import { colors } from "@packages/ui/theme/colors";

export const themePlugin = plugin(({ addBase }) => {
  const lightVars: Record<string, string> = {};
  const darkVars: Record<string, string> = {};

  Object.entries(colors).forEach(([key, val]) => {
    lightVars[`--color-${key}`] = val.light;
    darkVars[`--color-${key}`] = val.dark;
  });

  addBase({
    ":root": lightVars,
    ".dark": darkVars,
  });
});