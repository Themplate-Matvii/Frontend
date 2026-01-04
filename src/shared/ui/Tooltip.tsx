"use client";

import * as React from "react";
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
  children: React.ReactElement<any, any>;
};

const positionClasses: Record<TooltipPosition, string> = {
  [TooltipPosition.top]:
    "bottom-full left-1/2 -translate-x-1/2 mb-2",
  [TooltipPosition.bottom]:
    "top-full left-1/2 -translate-x-1/2 mt-2",
  [TooltipPosition.left]:
    "right-full top-1/2 -translate-y-1/2 mr-2",
  [TooltipPosition.right]:
    "left-full top-1/2 -translate-y-1/2 ml-2",
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
  children,
}: TooltipProps) {
  const [open, setOpen] = React.useState(false);
  const id = React.useId();

  const child = React.cloneElement(children, {
    "aria-describedby": open ? id : undefined,
    onMouseEnter: mergeHandlers(children.props.onMouseEnter, () =>
      setOpen(true),
    ),
    onMouseLeave: mergeHandlers(children.props.onMouseLeave, () =>
      setOpen(false),
    ),
    onFocus: mergeHandlers(children.props.onFocus, () =>
      setOpen(true),
    ),
    onBlur: mergeHandlers(children.props.onBlur, () =>
      setOpen(false),
    ),
  });

  return (
    <span className="relative inline-flex">
      {child}
      <span
        id={id}
        role="tooltip"
        className={clsx(
          "pointer-events-none absolute z-[60] select-none rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-text shadow-md transition-opacity",
          positionClasses[placement],
          open ? "opacity-100" : "opacity-0",
        )}
      >
        {content}
      </span>
    </span>
  );
}
