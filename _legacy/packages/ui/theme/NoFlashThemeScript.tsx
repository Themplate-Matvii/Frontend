"use client";

import { THEME_COOKIE } from "@packages/config";

export function NoFlashThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `!function(){try{
  var match=document.cookie.match(/(?:^|; )${THEME_COOKIE}=([^;]+)/);
  var t=match?decodeURIComponent(match[1]):null;
  var m=window.matchMedia('(prefers-color-scheme: dark)').matches;
  if(t==='dark'||(!t&&m)) document.documentElement.classList.add('dark');
  else document.documentElement.classList.remove('dark');
}catch(e){}}();`,
      }}
    />
  );
}
