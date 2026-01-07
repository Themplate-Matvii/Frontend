import plugin from "tailwindcss/plugin";
import { colors } from "../ui/theme/colors";

export const themePlugin = plugin(({ addBase }) => {
  const lightVars: Record<string, string> = {};
  const darkVars: Record<string, string> = {};

  Object.entries(colors).forEach(([key, value]) => {
    lightVars[`--color-${key}`] = value.light;
    darkVars[`--color-${key}`] = value.dark;
  });

  addBase({
    ":root": lightVars,
    ".dark": darkVars,
  });
});
