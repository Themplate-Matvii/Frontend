export type AssetKey = "logo" | "favicon";
export const ASSET_THEME_MAP: Record<
  AssetKey,
  { light?: string; dark?: string }
  >;

export type StaticImageData = {
  src: string;
  height: number;
  width: number;
  blurDataURL?: string;
};


declare module "*.png" {
  const value: StaticImageData;
  export default value;
}
declare module "*.ico" {
  const value: StaticImageData;
  export default value;
}
