"use client";

import { useCallback, useMemo, useState } from "react";

type UseDeleteWithConfirmOptions<T> = {
  canDelete?: boolean;
  getLabel?: (item: T) => string;
  onDelete: (item: T) => Promise<void> | void;
  onAfterDelete?: () => void;
};

type UseDeleteWithConfirmResult<T> = {
  target: T | null;
  isOpen: boolean;
  isPending: boolean;
  requiredValue: string;
  requestDelete: (item: T) => void;
  close: () => void;
  confirm: () => Promise<void>;
  modalProps: {
    open: boolean;
    onClose: () => void;
    requiredValue: string;
    onConfirm: () => Promise<void>;
  };
};

export function useDeleteWithConfirm<T>(
  options: UseDeleteWithConfirmOptions<T>,
): UseDeleteWithConfirmResult<T> {
  const { canDelete = true, getLabel, onDelete, onAfterDelete } = options;

  const [target, setTarget] = useState<T | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);

  const requiredValue = useMemo(() => {
    if (!target) return "";
    if (getLabel) return getLabel(target);
    return "";
  }, [target, getLabel]);

  const requestDelete = useCallback(
    (item: T) => {
      if (!canDelete) return;
      setTarget(item);
      setIsOpen(true);
    },
    [canDelete],
  );

  const close = useCallback(() => {
    if (isPending) return;
    setIsOpen(false);
    setTarget(null);
  }, [isPending]);

  const confirm = useCallback(async () => {
    if (!target || !canDelete) return;
    setIsPending(true);
    try {
      await onDelete(target);
      setIsOpen(false);
      setTarget(null);
      if (onAfterDelete) onAfterDelete();
    } finally {
      setIsPending(false);
    }
  }, [target, canDelete, onDelete, onAfterDelete]);

  return {
    target,
    isOpen,
    isPending,
    requiredValue,
    requestDelete,
    close,
    confirm,
    modalProps: {
      open: isOpen,
      onClose: close,
      requiredValue,
      onConfirm: confirm,
    },
  };
}
