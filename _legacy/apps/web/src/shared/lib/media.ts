import type { MediaUploadSelection } from "@/shared/components/media/MediaUploadField";

export function extractNameFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.split("/").filter(Boolean);
    const last = path[path.length - 1];
    if (!last) return null;
    return decodeURIComponent(last);
  } catch (err) {
    const parts = url.split("/").filter(Boolean);
    const last = parts[parts.length - 1];
    return last ? decodeURIComponent(last) : null;
  }
}

export function resolveMediaName(
  selection: MediaUploadSelection,
  fallback?: string,
): string | null {
  if (fallback && fallback.trim()) return fallback.trim();
  if (selection.type === "file") return selection.file.name;
  return extractNameFromUrl(selection.url);
}
