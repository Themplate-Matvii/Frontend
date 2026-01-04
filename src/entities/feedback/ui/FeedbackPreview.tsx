"use client";

import React from "react";
import { MessageSquare } from "lucide-react";

import { P, Small, TextColorEnum } from "@/shared/ui/Typography";
import type { Feedback } from "@/entities/feedback";

type FeedbackPreviewProps = {
  feedback: Feedback;
};

export const FeedbackPreview: React.FC<FeedbackPreviewProps> = ({
  feedback,
}) => {
  // Extract fields safely
  const name =
    (feedback as any).name ??
    (feedback as any).userName ??
    "";

  const email =
    (feedback as any).email ??
    (feedback as any).userEmail ??
    "";

  const phone =
    (feedback as any).phone ??
    "";

  const comment =
    (feedback as any).comment ??
    (feedback as any).message ??
    (feedback as any).content ??
    "";

  const created =
    (feedback as any).createdAt
      ? new Date((feedback as any).createdAt)
      : null;

  // Prepare preview text
  const preview =
    typeof comment === "string" && comment.length > 140
      ? comment.slice(0, 137) + "..."
      : comment;

  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <MessageSquare className="h-3.5 w-3.5" />
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        {/* Top row: name + email + phone + date */}
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
              {name && (
                <P className="text-sm font-medium truncate max-w-[120px] sm:max-w-[160px]">
                  {name}
                </P>
              )}

              {email && (
                <Small className="text-xs text-muted truncate max-w-[160px]">
                  {email}
                </Small>
              )}

              {phone && (
                <Small className="text-xs text-muted">
                  {phone}
                </Small>
              )}
            </div>
          </div>

          {created && (
            <Small className="text-[11px] text-muted shrink-0 sm:ml-2">
              {created.toLocaleDateString()}
            </Small>
          )}
        </div>

        {/* Bottom row: comment preview */}
        {preview && (
          <Small
            color={TextColorEnum.Secondary}
            className="text-xs line-clamp-2 sm:line-clamp-1"
          >
            {preview}
          </Small>
        )}
      </div>
    </div>
  );
};
