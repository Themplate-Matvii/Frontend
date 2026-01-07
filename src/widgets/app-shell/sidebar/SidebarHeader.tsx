"use client";

import clsx from "clsx";
import { ChevronLeft } from "lucide-react";
import Tooltip, { TooltipPosition } from "@/shared/ui/Tooltip";
import { Logo } from "@/shared/layout/Logo";
import { Button, ButtonSizeEnum, ButtonVariantEnum } from "@/shared/ui/Button";

type SidebarHeaderProps = {
  isExpanded: boolean;
  pinned: boolean;
  isHovering: boolean;
  onTogglePin: (event: React.MouseEvent<HTMLButtonElement>) => void;
  toggleTooltip: string;
  toggleTooltipPinned: string;
  onMouseDownPin: () => void;
};

export const SidebarHeader = ({
  isExpanded,
  pinned,
  isHovering,
  onTogglePin,
  toggleTooltip,
  toggleTooltipPinned,
  onMouseDownPin,
}: SidebarHeaderProps) => {
  return (
    <div className="relative flex items-center h-14 border-b border-border pl-3 pr-10 py-2">
      <div
        className={clsx(
          "flex items-center min-w-0 transition-all duration-200",
          isExpanded ? "gap-2" : "justify-center w-full",
        )}
      >
        {isExpanded ? (
          <Logo width={120} height={34} />
        ) : (
          <div className="h-9 w-9 flex items-center justify-center rounded-md">
            <Logo compact width={34} height={34} />
          </div>
        )}
      </div>

      <Tooltip
        content={pinned ? toggleTooltipPinned : toggleTooltip}
        placement={TooltipPosition.bottom}
        offsetPx={8}
      >
        <Button
          variant={ButtonVariantEnum.secondary}
          size={ButtonSizeEnum.sm}
          onMouseDown={onMouseDownPin}
          onClick={onTogglePin}
          className={clsx(
            "absolute right-2 top-1/2 -translate-y-1/2",
            "h-8 w-8 !px-0 !py-0", // Removes default padding
            "rounded-md border border-border !text-text", // Matches original style
            "hover:bg-surface !hover:text-text transition-all duration-300 motion-reduce:transition-none",
            !pinned && isHovering ? "rotate-180" : "rotate-0",
            pinned ? "opacity-100" : isExpanded ? "opacity-100" : "opacity-0 pointer-events-none",
          )}
        >
          <ChevronLeft size={18} />
        </Button>
      </Tooltip>
    </div>
  );
};
