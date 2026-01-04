"use client";

import clsx from "clsx";
import { useRouter } from "next/navigation";

import { useAuth, UserPreview } from "@/entities/identity";

type SidebarAccountProps = {
  isExpanded: boolean;
  variant: "desktop" | "mobile";
  onAfterNavigate?: () => void;
};

export const SidebarAccount = ({
  isExpanded,
  variant,
  onAfterNavigate,
}: SidebarAccountProps) => {
  const router = useRouter();
  const { user } = useAuth();

  const handleClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    router.push("/dashboard/account");
    if (onAfterNavigate) onAfterNavigate();
  };

  const showExpandedContent = variant === "desktop" ? isExpanded : true;
  const hideText = variant === "desktop" && !isExpanded;

  return (
    <div
      className="border-b border-border px-3 py-3 cursor-pointer"
      onClick={handleClick}
    >
      <div
        className={clsx(
          "flex items-center transition-all duration-200",
          variant === "desktop"
            ? isExpanded
              ? "justify-start"
              : "justify-center"
            : "justify-start",
        )}
      >
        <UserPreview
          user={user ?? null}
          showEmail={!!user?.email && !!user?.name}
          showPlan
          showRoleBadge
          size="md"
          hideText={!showExpandedContent || hideText}
        />
      </div>
    </div>
  );
};
