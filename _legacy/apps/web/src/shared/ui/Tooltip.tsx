"use client";

import * as React from "react";
import {
  useFloating,
  offset,
  flip,
  shift,
  arrow as arrowMiddleware,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  autoUpdate,
} from "@floating-ui/react";
import clsx from "clsx";

export enum TooltipPosition {
  top = "top",
  bottom = "bottom",
  left = "left",
  right = "right",
}

type TooltipProps = {
  content: React.ReactNode;
  placement?: TooltipPosition;
  offsetPx?: number;
  children: React.ReactElement<any, any>;
};

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (value: T) => {
    for (const ref of refs) {
      if (!ref) continue;
      if (typeof ref === "function") ref(value);
      else (ref as React.MutableRefObject<T | null>).current = value;
    }
  };
}

export default function Tooltip({
  content,
  placement = TooltipPosition.top,
  offsetPx = 8,
  children,
}: TooltipProps) {
  const [open, setOpen] = React.useState(false);
  const arrowRef = React.useRef<HTMLDivElement | null>(null);

  const {
    refs,
    floatingStyles,
    context,
    middlewareData,
    placement: actualPlacement,
  } = useFloating<HTMLElement>({
    open,
    onOpenChange: setOpen,
    placement,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(offsetPx),
      flip(),
      shift({ padding: 8 }),
      arrowMiddleware({ element: arrowRef }),
    ],
  });

  const hover = useHover(context, {
    move: false,
    delay: { open: 120, close: 80 },
  });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: "tooltip" });

  const { getReferenceProps, getFloatingProps } = useInteractions([
    hover,
    focus,
    dismiss,
    role,
  ]);

  const id = React.useId();

  const referenceProps = getReferenceProps({
    "aria-describedby": open ? id : undefined,
  });

  const mergedRef = mergeRefs<any>(
    (children as any).ref,
    refs.setReference as unknown as React.Ref<any>,
  );

  const child = React.cloneElement(
    children,
    Object.assign({}, children.props, referenceProps, { ref: mergedRef }),
  );

  const sideKey =
    actualPlacement === TooltipPosition.top
      ? "bottom"
      : actualPlacement === TooltipPosition.bottom
      ? "top"
      : actualPlacement === TooltipPosition.left
      ? "right"
      : "left";

  const arrowClassBySide =
    actualPlacement === TooltipPosition.top
      ? "border-t-0 border-l-0"
      : actualPlacement === TooltipPosition.bottom
      ? "border-b-0 border-r-0"
      : actualPlacement === TooltipPosition.left
      ? "border-l-0 border-b-0"
      : "border-t-0 border-r-0";

  const arrowSideOffset = -6;

  return (
    <div className="cursor-pointer">
      {child}

      <FloatingPortal>
        {open && (
          <div
            ref={refs.setFloating}
            style={floatingStyles}
            {...getFloatingProps({
              id,
              className:
                "z-[60] overflow-visible select-none pointer-events-none rounded-md border border-border bg-background text-text px-2.5 py-1.5 text-xs shadow-md transition-opacity transition-colors duration-300",
            })}
            data-placement={actualPlacement}
          >
            <div className="leading-tight">{content}</div>

            <div
              ref={arrowRef}
              className={clsx(
                "absolute w-2.5 h-2.5 rotate-45 bg-background border border-border transition-colors duration-300",
                arrowClassBySide,
              )}
              style={
                {
                  left:
                    middlewareData.arrow?.x != null
                      ? `${middlewareData.arrow.x}px`
                      : "",
                  top:
                    middlewareData.arrow?.y != null
                      ? `${middlewareData.arrow.y}px`
                      : "",
                  [sideKey]: `${arrowSideOffset}px`,
                } as React.CSSProperties
              }
            />
          </div>
        )}
      </FloatingPortal>
    </div>
  );
}
