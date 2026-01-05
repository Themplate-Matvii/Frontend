"use client";

import * as React from "react";
import { createPortal } from "react-dom";
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

function mergeHandlers<T extends React.SyntheticEvent>(
  original?: (event: T) => void,
  next?: (event: T) => void,
) {
  return (event: T) => {
    original?.(event);
    next?.(event);
  };
}

export default function Tooltip({
  content,
  placement = TooltipPosition.top,
  offsetPx = 8,
  children,
}: TooltipProps) {
  const [open, setOpen] = React.useState(false);
  const [currentPlacement, setCurrentPlacement] =
    React.useState<TooltipPosition>(placement);
  const triggerRef = React.useRef<HTMLElement | null>(null);
  const tooltipRef = React.useRef<HTMLDivElement | null>(null);
  const [coords, setCoords] = React.useState<{ top: number; left: number } | null>(
    null,
  );
  const [arrowStyle, setArrowStyle] = React.useState<React.CSSProperties>({});
  const openTimerRef = React.useRef<number | null>(null);
  const closeTimerRef = React.useRef<number | null>(null);
  const id = React.useId();

  const clearTimers = React.useCallback(() => {
    if (openTimerRef.current) {
      window.clearTimeout(openTimerRef.current);
      openTimerRef.current = null;
    }
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const handleOpen = React.useCallback(() => {
    clearTimers();
    openTimerRef.current = window.setTimeout(() => {
      setOpen(true);
    }, 120);
  }, [clearTimers]);

  const handleClose = React.useCallback(() => {
    clearTimers();
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
    }, 80);
  }, [clearTimers]);

  const updatePosition = React.useCallback(() => {
    if (!open || !triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const padding = 8;

    const spaces = {
      top: triggerRect.top,
      bottom: viewportHeight - triggerRect.bottom,
      left: triggerRect.left,
      right: viewportWidth - triggerRect.right,
    };

    const fits = {
      top: spaces.top >= tooltipRect.height + offsetPx,
      bottom: spaces.bottom >= tooltipRect.height + offsetPx,
      left: spaces.left >= tooltipRect.width + offsetPx,
      right: spaces.right >= tooltipRect.width + offsetPx,
    };

    const ordered: TooltipPosition[] = [
      placement,
      TooltipPosition.top,
      TooltipPosition.bottom,
      TooltipPosition.right,
      TooltipPosition.left,
    ].filter((value, index, self) => self.indexOf(value) === index);

    const nextPlacement =
      ordered.find((value) => fits[value]) ??
      (Object.entries(spaces).sort((a, b) => b[1] - a[1])[0][0] as TooltipPosition);

    setCurrentPlacement(nextPlacement);

    let top = 0;
    let left = 0;

    if (nextPlacement === TooltipPosition.top || nextPlacement === TooltipPosition.bottom) {
      left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;
      left = Math.min(Math.max(left, padding), viewportWidth - tooltipRect.width - padding);
      top =
        nextPlacement === TooltipPosition.top
          ? triggerRect.top - tooltipRect.height - offsetPx
          : triggerRect.bottom + offsetPx;
    } else {
      top = triggerRect.top + triggerRect.height / 2 - tooltipRect.height / 2;
      top = Math.min(Math.max(top, padding), viewportHeight - tooltipRect.height - padding);
      left =
        nextPlacement === TooltipPosition.left
          ? triggerRect.left - tooltipRect.width - offsetPx
          : triggerRect.right + offsetPx;
    }

    setCoords({ top, left });

    const arrowSize = 10;
    const arrowPadding = 6;
    const arrowOffset = -6;

    if (nextPlacement === TooltipPosition.top || nextPlacement === TooltipPosition.bottom) {
      const center =
        triggerRect.left + triggerRect.width / 2 - left - arrowSize / 2;
      const clamped = Math.min(
        Math.max(center, arrowPadding),
        tooltipRect.width - arrowPadding - arrowSize,
      );
      setArrowStyle({
        left: `${clamped}px`,
        [nextPlacement === TooltipPosition.top ? "bottom" : "top"]: `${arrowOffset}px`,
      });
    } else {
      const center =
        triggerRect.top + triggerRect.height / 2 - top - arrowSize / 2;
      const clamped = Math.min(
        Math.max(center, arrowPadding),
        tooltipRect.height - arrowPadding - arrowSize,
      );
      setArrowStyle({
        top: `${clamped}px`,
        [nextPlacement === TooltipPosition.left ? "right" : "left"]: `${arrowOffset}px`,
      });
    }
  }, [open, offsetPx, placement]);

  React.useLayoutEffect(() => {
    if (!open) return;
    let raf1 = requestAnimationFrame(() => updatePosition());
    let raf2 = requestAnimationFrame(() => updatePosition());
    return () => {
      cancelAnimationFrame(raf1);
      cancelAnimationFrame(raf2);
    };
  }, [open, updatePosition]);

  React.useEffect(() => {
    if (!open) return;
    const handleScroll = () => updatePosition();
    window.addEventListener("scroll", handleScroll, true);
    window.addEventListener("resize", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll, true);
      window.removeEventListener("resize", handleScroll);
    };
  }, [open, updatePosition]);

  React.useEffect(() => () => clearTimers(), [clearTimers]);

  const child = React.cloneElement(children, {
    ref: triggerRef,
    "aria-describedby": open ? id : undefined,
    onMouseEnter: mergeHandlers(children.props.onMouseEnter, handleOpen),
    onMouseLeave: mergeHandlers(children.props.onMouseLeave, handleClose),
    onFocus: mergeHandlers(children.props.onFocus, handleOpen),
    onBlur: mergeHandlers(children.props.onBlur, handleClose),
  });

  const arrowClassBySide =
    currentPlacement === TooltipPosition.top
      ? "border-t-0 border-l-0"
      : currentPlacement === TooltipPosition.bottom
      ? "border-b-0 border-r-0"
      : currentPlacement === TooltipPosition.left
      ? "border-l-0 border-b-0"
      : "border-t-0 border-r-0";

  return (
    <span className="relative inline-flex">
      {child}
      {open &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={tooltipRef}
            id={id}
            role="tooltip"
            data-placement={currentPlacement}
            className="z-[60] overflow-visible select-none pointer-events-none rounded-md border border-border bg-background text-text px-2.5 py-1.5 text-xs shadow-md transition-opacity transition-colors duration-300"
            style={
              coords
                ? { position: "fixed", top: coords.top, left: coords.left }
                : { position: "fixed", top: 0, left: 0, visibility: "hidden" }
            }
          >
            <div className="leading-tight">{content}</div>
            <div
              className={clsx(
                "absolute h-2.5 w-2.5 rotate-45 bg-background border border-border transition-colors duration-300",
                arrowClassBySide,
              )}
              style={arrowStyle}
            />
          </div>,
          document.body,
        )}
    </span>
  );
}
