"use client";

// Comments in English only

import Link from "next/link";
import { z } from "zod";
import { useState } from "react";
import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import { Button, ButtonSizeEnum } from "@/shared/ui/Button";
import { UserApi } from "@/entities/user";
import { forgotPasswordSchema } from "@/entities/user/api/user/auth/validation";

import { AuthView } from "@/widgets/auth/auth-view";
import { useAuthForm, FieldErrorsList } from "@/features/auth/lib/useAuthForm";

import Field from "@/shared/ui/forms/Field";
import Input from "@/shared/ui/forms/Input";
import Spinner from "@/shared/ui/loading/Spinner";
import FormMessage, { FormMessageVariant } from "@/shared/ui/forms/FormMessage";

/** Forgot-password form values */
type ForgotValues = { email: string };

export const ForgotPasswordForm = () => {
  const { t } = useI18n();
  const { mutateAsync: forgot, isPending } = UserApi.Auth.useForgotPassword();

  const [variant, setVariant] = useState<FormMessageVariant | null>(null);

  const {
    values,
    handleChange,
    fieldErrors,
    globalMsg,
    setGlobalMsg,
    onSubmit,
    isBusy,
  } = useAuthForm<ForgotValues>({
    initial: { email: "" },
    schema: forgotPasswordSchema as z.ZodSchema<ForgotValues>,
    pick: { email: forgotPasswordSchema.pick({ email: true }) },
    submit: async (v) => {
      const res = await forgot({ email: v.email });
      if (res?.success) {
        setVariant(FormMessageVariant.success);
        setGlobalMsg(t(messages.auth.forgotPasswordEmailSent));
      } else {
        setVariant(FormMessageVariant.error);
        setGlobalMsg(res?.message || t(messages.auth.forgotPasswordError));
      }
    },
    googleEnabled: false,
    redirectTo: null, // <-- disable redirect after submit
  });

  const loading = isBusy || isPending;

  const formEl = (
    <form onSubmit={onSubmit} className="space-y-4">
      <Field
        id="email"
        label={t(messages.auth.email)}
        footer={<FieldErrorsList errors={fieldErrors.email} />}
      >
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder={t(messages.auth.emailPlaceholder)}
          value={values.email}
          onChange={handleChange("email")}
          invalid={Boolean(fieldErrors.email?.length)}
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
            {t(messages.auth.sendResetLink)}
          </span>
        ) : (
          t(messages.auth.sendResetLink)
        )}
      </Button>

      {globalMsg && variant && (
        <FormMessage variant={variant}>{globalMsg}</FormMessage>
      )}
    </form>
  );

  const linksRow = (
    <>
      <Link href="/auth/sign-in" className="underline">
        {t(messages.auth.signInTitle)}
      </Link>
      <Link href="/auth/sign-up" className="underline">
        {t(messages.auth.createAccount)}
      </Link>
    </>
  );

  return (
    <AuthView
      title={t(messages.auth.forgotPasswordTitle)}
      description={t(messages.auth.forgotPasswordSubtitle)}
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
