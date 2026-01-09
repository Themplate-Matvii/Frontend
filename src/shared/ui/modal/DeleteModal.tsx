"use client";

import { useEffect, useState } from "react";

import { Modal, ModalSize } from "./Modal";
import Field from "@/shared/ui/forms/Field";
import Input from "@/shared/ui/forms/Input";
import { Button, ButtonSizeEnum, ButtonVariantEnum } from "@/shared/ui/Button";
import Spinner from "@/shared/ui/loading/Spinner";
import { Small, TextColorEnum } from "@/shared/ui/Typography";
import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";

type DeleteModalProps = {
  open: boolean;
  onClose: () => void;
  /** Exact value the user must type to confirm deletion (e.g. full name or item name). */
  requiredValue: string;
  /** Async delete handler. All side effects (logout, redirects, etc.) live here. */
  onConfirm: () => Promise<void>;
};

export function DeleteModal({
  open,
  onClose,
  requiredValue,
  onConfirm,
}: DeleteModalProps) {
  const { t } = useI18n();
  const [value, setValue] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) {
      setValue("");
      setLoading(false);
    }
  }, [open]);

  const disabled = loading || !value.trim() || value.trim() !== requiredValue;

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const handleConfirm = async () => {
    if (disabled) return;
    try {
      setLoading(true);
      await onConfirm();
      // If onConfirm does not close the modal (e.g. in non-self-delete flows),
      // parent can keep it open or close it after success.
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={handleClose}
      size={ModalSize.md}
      loading={loading}
      title={t(messages.common.modal.delete.title)}
      description={t(messages.common.modal.delete.description)}
    >
      <div className="space-y-4">
        <div className="space-y-1">
          <Small className="font-medium" color={TextColorEnum.Default}>
            {t(messages.common.modal.delete.confirmLabel, {
              name: requiredValue,
            })}
          </Small>
        </div>

        <Field id="delete-confirm" label={""}>
          <Input
            id="delete-confirm"
            value={value}
            onChange={(event) => setValue(event.target.value)}
            placeholder={t(messages.common.modal.delete.confirmPlaceholder)}
            autoComplete="off"
          />
        </Field>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            type="button"
            size={ButtonSizeEnum.md}
            variant={ButtonVariantEnum.secondary}
            onClick={handleClose}
            disabled={loading}
          >
            {t(messages.common.actions.cancel)}
          </Button>

          <Button
            type="button"
            size={ButtonSizeEnum.md}
            variant={ButtonVariantEnum.danger}
            disabled={disabled}
            onClick={handleConfirm}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <Spinner size={16} />
                {t(messages.common.actions.delete)}
              </span>
            ) : (
              t(messages.common.actions.delete)
            )}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
