"use client";

import { THEME_COOKIE } from "@/shared/config";

export function NoFlashThemeScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `!function(){try{
  var match=document.cookie.match(/(?:^|; )${THEME_COOKIE}=([^;]+)/);
  var t=match?decodeURIComponent(match[1]):null;
  var m=window.matchMedia('(prefers-color-scheme: dark)').matches;
  var resolved=(t==='system'||!t)?(m?'dark':'light'):t;
  document.documentElement.classList.toggle('dark', resolved==='dark');
  document.documentElement.dataset.theme=t||resolved;
}catch(e){}}();`,
      }}
    />
  );
}
