"use client";

import clsx from "clsx";

import { CircleHelp } from "lucide-react";

import Tooltip, { TooltipPosition } from "@/shared/ui/Tooltip";
import { Small } from "@/shared/ui/Typography";

interface StatCardProps {
  label: string;
  value: string;
  helper?: string;
  trend?: string;
  accent?: string;
  tooltip?: string;
}

export function StatCard({ label, value, helper, trend, accent, tooltip }: StatCardProps) {
  return (
    <div
      className={clsx(
        "rounded-xl border border-border bg-surface p-4 shadow-sm",
        "hover:border-primary/60 transition-colors duration-200",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-1.5">
            <p className="text-xs uppercase tracking-wide text-muted">{label}</p>
            {tooltip && (
              <Tooltip content={tooltip} placement={TooltipPosition.top}>
                <span
                  className="text-muted hover:text-text transition-colors inline-flex"
                  role="img"
                  aria-label={tooltip}
                >
                  <CircleHelp size={14} />
                </span>
              </Tooltip>
            )}
          </div>
          <p className="text-2xl font-semibold text-text leading-tight">{value}</p>
          {helper && <Small className="text-muted">{helper}</Small>}
        </div>
        {trend && (
          <span className="text-xs font-semibold text-primary bg-primary/10 rounded-full px-2 py-1">
            {trend}
          </span>
        )}
      </div>

      {accent && (
        <div className="mt-3 h-1.5 rounded-full overflow-hidden bg-border">
          <div
            className="h-full bg-gradient-to-r from-primary/80 via-primary to-primary/60 animate-pulse"
            style={{ width: accent }}
          />
        </div>
      )}
    </div>
  );
}
