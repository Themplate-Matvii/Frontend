"use client";

import React from "react";

import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import { P, Small, TextColorEnum } from "@/shared/ui/Typography";

export const NoPermissionNotice: React.FC = () => {
  const { t } = useI18n();

  return (
    <div className="space-y-2 pt-4">
      <P className="font-semibold" color={TextColorEnum.Danger}>
        {t(messages.common.noPermission.title)}
      </P>
      <Small color={TextColorEnum.Secondary}>
        {t(messages.common.noPermission.description)}
      </Small>
    </div>
  );
};
