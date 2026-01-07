"use client";

import { THEME_STORAGE_KEY } from "@/shared/config";

export function NoFlashThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `!function(){try{
  var t=localStorage.getItem('${THEME_STORAGE_KEY}');
  var m=window.matchMedia('(prefers-color-scheme: dark)').matches;
  var resolved=(t==='dark'||t==='light')?t:(m?'dark':'light');
  document.documentElement.classList.toggle('dark', resolved==='dark');
  document.documentElement.dataset.theme=t||resolved;
  document.documentElement.dataset.resolvedTheme=resolved;
}catch(e){}}();`,
      }}
    />
  );
}
