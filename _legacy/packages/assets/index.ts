import { StaticImageData } from './index.d';


// helper to normalize image imports
const src = (v: StaticImageData | string | undefined) =>
  typeof v === "string" ? v : (v?.src ?? undefined);

// === LOGO ===
import _logoLight from "./logo/logo-light.png";
import _logoDark from "./logo/logo-dark.png";

export const LogoLight: string = src(_logoLight)!;
export const LogoDark: string = src(_logoDark)!;

// === FAVICON ===
import _favLight from "./favicon/favicon-dark.png";
import _favDark from "./favicon/favicon-light.png";

export const FaviconLight: string = src(_favLight)!;
export const FaviconDark: string = src(_favDark)!;

// === THEME MAP ===
export const ASSET_THEME_MAP = {
  logo: { light: LogoLight, dark: LogoDark },
};

export type AssetKey = keyof typeof ASSET_THEME_MAP;
