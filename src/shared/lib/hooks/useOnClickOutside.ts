"use client";
import { useEffect } from "react";

type Options = {
  enabled?: boolean;
  events?: ReadonlyArray<"mousedown" | "touchstart" | "pointerdown">;
};

export function useOnClickOutside(
  refs: React.RefObject<HTMLElement | null> | Array<React.RefObject<HTMLElement | null>>,
  handler: (ev: Event) => void,
  { enabled = true, events = ["mousedown", "touchstart"] }: Options = {},
) {
  useEffect(() => {
    if (!enabled) return;

    const refList = Array.isArray(refs) ? refs : [refs];

    const listener = (event: Event) => {
      const target = event.target;
      if (!(target instanceof Node)) return;

      for (const r of refList) {
        const el = r.current;
        if (el && el.contains(target)) return;
      }

      handler(event);
    };

    events.forEach((e) => document.addEventListener(e, listener, true));
    return () => {
      events.forEach((e) => document.removeEventListener(e, listener, true));
    };
  }, [refs, handler, enabled, events]);
}
