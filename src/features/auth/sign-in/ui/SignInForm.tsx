"use client";

import Link from "next/link";
import { z } from "zod";
import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import { Button, ButtonSizeEnum } from "@/shared/ui/Button";
import { UserApi, OAuthIntent } from "@/entities/identity";
import { loginSchema } from "@/entities/identity/auth/api/auth/validation";

import { AuthView } from "@/widgets/auth/auth-view";
import { useAuthForm, FieldErrorsList } from "@/features/auth/lib/useAuthForm";

import Field from "@/shared/ui/forms/Field";
import Input from "@/shared/ui/forms/Input";
import PasswordInput from "@/shared/ui/forms/PasswordInput";
import Spinner from "@/shared/ui/loading/Spinner";
import FormMessage, {
  FormMessageVariant,
} from "@/shared/ui/forms/FormMessage";
import { GoogleButton } from "@/shared/ui/oauth/GoogleButton";

/** Sign-in form values */
type SignInValues = { email: string; password: string };

export const SignInForm = () => {
  const { t } = useI18n();

  // API hook for credentials sign-in
  const { mutateAsync: login, isPending: isLoginPending } =
    UserApi.Auth.useLogin();

  // Shared auth form logic + Google OAuth (popup PKCE)
  const {
    values,
    handleChange,
    fieldErrors,
    globalMsg,
    onSubmit,
    google,
    isBusy: isOauthBusy,
  } = useAuthForm<SignInValues>({
    initial: { email: "", password: "" },
    schema: loginSchema as z.ZodSchema<SignInValues>,
    pick: {
      email: loginSchema.pick({ email: true }),
      password: loginSchema.pick({ password: true }),
    },
    submit: async (v) => {
      await login({ email: v.email, password: v.password });
    },
    successToastKey: messages.notifications.auth.loginSuccess,
    redirectTo: "/dashboard",
    googleEnabled: true,
    oauthIntent: OAuthIntent.login,
  });

  const isBusy = isLoginPending || isOauthBusy;
  const showSocial = Boolean(google);

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
          invalid={Boolean(fieldErrors.password?.length)}
        />
      </Field>

      <Button
        type="submit"
        disabled={isBusy}
        size={ButtonSizeEnum.md}
        className="w-full"
      >
        {isLoginPending ? (
          <span className="inline-flex items-center gap-2">
            <Spinner size={16} />
            {t(messages.auth.login)}
          </span>
        ) : (
          t(messages.auth.login)
        )}
      </Button>

      {globalMsg && (
        <FormMessage variant={FormMessageVariant.error}>
          {globalMsg}
        </FormMessage>
      )}
    </form>
  );

  const linksRow = (
    <>
      <Link href="/auth/forgot-password" className="underline">
        {t(messages.auth.forgotPassword)}
      </Link>
      <Link href="/auth/sign-up" className="underline">
        {t(messages.auth.createAccount)}
      </Link>
    </>
  );

  return (
    <AuthView
      title={t(messages.auth.signInTitle)}
      description={t(messages.auth.signInSubtitle)}
      form={formEl}
      loading={isBusy}
      topAlertSlot={<></>}
      dividerLabel={showSocial ? t(messages.auth.orContinueWith) : undefined}
      socialSlot={
        showSocial ? (
          // keep Google button wiring as before
          <GoogleButton google={google!} disabled={isBusy} />
        ) : undefined
      }
      linksRowSlot={linksRow}
      footerNote={t(messages.auth.agreeNote)}
    />
  );
};
