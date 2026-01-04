"use client";

// Comments in English only

import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { z } from "zod";
import { useState } from "react";
import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import { Button, ButtonSizeEnum } from "@/shared/ui/Button";
import { UserApi } from "@/entities/identity";
import { strongPassword } from "@/entities/identity/auth/api/auth/validation";
import { AuthView } from "@/widgets/auth/auth-view";
import { useAuthForm, FieldErrorsList } from "@/features/auth/lib/useAuthForm";
import Field from "@/shared/ui/forms/Field";
import PasswordInput from "@/shared/ui/forms/PasswordInput";
import Spinner from "@/shared/ui/loading/Spinner";
import FormMessage, { FormMessageVariant } from "@/shared/ui/forms/FormMessage";
import { toast } from "@/shared/ui/toast";

/** Reset password schema */
const resetPasswordSchema = z.object({
  password: strongPassword,
  confirmPassword: z.string(),
});
type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordForm = () => {
  const { t } = useI18n();
  const params = useSearchParams();
  const token = params.get("token");

  const { mutateAsync: reset, isPending } = UserApi.Auth.useResetPassword();
  const [variant, setVariant] = useState<FormMessageVariant | null>(null);

  const {
    values,
    handleChange,
    fieldErrors,
    globalMsg,
    setGlobalMsg,
    onSubmit,
    isBusy,
  } = useAuthForm<ResetPasswordValues>({
    initial: { password: "", confirmPassword: "" },
    schema: resetPasswordSchema.refine((data) => data.password === data.confirmPassword, {
      message: messages.validation.passwordMismatch,
      path: ["confirmPassword"],
    }) as z.ZodSchema<ResetPasswordValues>,
    pick: {
      password: strongPassword,
      confirmPassword: z.string(),
    },
    submit: async (v) => {
      if (!token) {
        setVariant(FormMessageVariant.error);
        const message = t(messages.auth.tokenMissing);
        setGlobalMsg(message);
        toast.error(message);
        return;
      }

      const res = await reset({ token, newPassword: v.password });

      if (res?.success) {
        setVariant(FormMessageVariant.success);
        // show backend message if present, fallback to i18n
        const message =
          res.message ?? t(messages.auth.passwordResetSuccess);
        setGlobalMsg(message);
        toast.success(t(messages.notifications.auth.passwordResetSuccess));
      } else {
        setVariant(FormMessageVariant.error);
        const message =
          res?.message ?? t(messages.auth.passwordResetError);
        setGlobalMsg(message);
        toast.error(message);
      }
    },
    googleEnabled: false,
    redirectTo: null, // do not redirect automatically
  });

  const loading = isBusy || isPending;

  const formEl = (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field
        id="password"
        label={t(messages.auth.password)}
        footer={<FieldErrorsList errors={fieldErrors.password} />}
      >
        <PasswordInput
          id="password"
          placeholder={t(messages.auth.passwordPlaceholder)}
          value={values.password}
          onChange={handleChange("password")}
          autoComplete="new-password"
          invalid={Boolean(fieldErrors.password?.length)}
          showStrength
        />
      </Field>

      <Field
        id="confirmPassword"
        label={t(messages.auth.confirmPassword)}
        footer={<FieldErrorsList errors={fieldErrors.confirmPassword} />}
      >
        <PasswordInput
          id="confirmPassword"
          placeholder={t(messages.auth.passwordPlaceholder)}
          value={values.confirmPassword}
          onChange={handleChange("confirmPassword")}
          autoComplete="new-password"
          invalid={Boolean(fieldErrors.confirmPassword?.length)}
        />
      </Field>

      <Button
        type="submit"
        disabled={loading}
        size={ButtonSizeEnum.md}
        className="w-full"
      >
        {loading ? (
          <span className="inline-flex items-center gap-2">
            <Spinner size={16} />
            {t(messages.auth.resettingPassword)}
          </span>
        ) : (
          t(messages.auth.resetPassword)
        )}
      </Button>

      {globalMsg && variant && (
        <FormMessage variant={variant}>{globalMsg}</FormMessage>
      )}
    </form>
  );

  const linksRow = (
    <div className="flex justify-center items-center flex-1">
      <Link href="/auth/sign-in" className="underline">
        {t(messages.auth.signInTitle)}
      </Link>
    </div>
  );

  return (
    <AuthView
      title={t(messages.auth.resetPasswordTitle)}
      description={t(messages.auth.resetPasswordSubtitle)}
      form={formEl}
      loading={loading}
      topAlertSlot={null}
      dividerLabel={undefined}
      socialSlot={undefined}
      linksRowSlot={linksRow}
      footerNote={t(messages.auth.agreeNote)}
    />
  );
};
