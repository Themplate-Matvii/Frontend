"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { z } from "zod";
import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import { Button, ButtonSizeEnum } from "@/shared/ui/Button";
import { Theme } from "@/shared/ui";
import { useTheme } from "@/shared/lib/theme";
import { UserApi, OAuthIntent } from "@/entities/user";
import { registerSchema } from "@/entities/user/api/user/auth/validation";

import { AuthView } from "@/widgets/auth/auth-view";
import { useAuthForm, FieldErrorsList } from "@/features/auth/lib/useAuthForm";
import { GoogleButton } from "@/shared/ui/oauth/GoogleButton";

import Field from "@/shared/ui/forms/Field";
import Input from "@/shared/ui/forms/Input";
import PasswordInput from "@/shared/ui/forms/PasswordInput";
import Spinner from "@/shared/ui/loading/Spinner";
import FormMessage, { FormMessageVariant } from "@/shared/ui/forms/FormMessage";
import {
  MediaUploadField,
  type MediaUploadSelection,
} from "@/features/media/upload";

/** Register form values */
type RegisterValues = {
  name?: string;
  email: string;
  password: string;
  theme?: Theme;
  avatar?: string;
  avatarUrl?: string;
  avatarFile?: File | null;
};

export const SignUpForm = () => {
  const { t } = useI18n();
  const { theme } = useTheme();

  const [passwordStrengthVisible, setPasswordStrengthVisible] = useState(false);
  const [avatarSelection, setAvatarSelection] =
    useState<MediaUploadSelection | null>(null);

  const { mutateAsync: register, isPending: isRegisterPending } =
    UserApi.Auth.useRegister();

  const {
    values,
    setValues,
    handleChange,
    fieldErrors,
    setFieldErrors,
    globalMsg,
    submitValues,
    google,
    isBusy: isOauthBusy,
  } = useAuthForm<RegisterValues>({
    initial: {
      name: "",
      email: "",
      password: "",
      theme,
      avatar: undefined,
      avatarUrl: undefined,
      avatarFile: null,
    },
    schema: registerSchema as z.ZodSchema<RegisterValues>,
    pick: {
      name: registerSchema.pick({ name: true }),
      email: registerSchema.pick({ email: true }),
      password: registerSchema.pick({ password: true }),
      avatar: registerSchema.pick({ avatar: true }),
      avatarUrl: registerSchema.pick({ avatarUrl: true }),
    },
    submit: async (v) => {
      await register({
        email: v.email,
        password: v.password,
        name: v.name?.trim(),
        theme,
        avatar: v.avatar,
        avatarUrl: v.avatarUrl,
        avatarFile:
          avatarSelection?.type === "file" ? avatarSelection.file : undefined,
      });
    },
    redirectTo: "/dashboard",
    googleEnabled: true,
    oauthIntent: OAuthIntent.register,
  });

  const handleAvatarSelectionChange = useCallback(
    (selection: MediaUploadSelection | null) => {
      setAvatarSelection(selection);

      setValues((prev) => ({
        ...prev,
        avatar: undefined,
        avatarUrl: selection?.type === "url" ? selection.url : undefined,
        avatarFile: selection?.type === "file" ? selection.file : null,
      }));

      setFieldErrors((prev) => {
        const { avatar, avatarUrl, ...rest } = prev;
        return rest;
      });
    },
    [setValues, setFieldErrors],
  );

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!passwordStrengthVisible) {
      setPasswordStrengthVisible(true);
    }

    const payload: RegisterValues = { ...values };

    payload.theme = theme;

    if (avatarSelection?.type === "url") {
      payload.avatarUrl = avatarSelection.url;
      payload.avatar = undefined;
      payload.avatarFile = null;
    } else if (avatarSelection?.type === "file") {
      payload.avatarFile = avatarSelection.file;
      payload.avatarUrl = undefined;
      payload.avatar = undefined;
    } else {
      payload.avatarUrl = undefined;
      payload.avatarFile = null;
    }

    await submitValues(payload);
  };

  const isBusy = isRegisterPending || isOauthBusy;
  const showSocial = Boolean(google);

  const formEl = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Field
        id="name"
        label={t(messages.validation.nameLabel)}
        footer={<FieldErrorsList errors={fieldErrors.name} />}
      >
        <Input
          id="name"
          placeholder={t(messages.validation.namePlaceholder)}
          value={values.name || ""}
          onChange={handleChange("name")}
          invalid={Boolean(fieldErrors.name?.length)}
        />
      </Field>

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
          autoComplete="new-password"
          invalid={Boolean(fieldErrors.password?.length)}
          showStrength={passwordStrengthVisible}
          showGenerateStrength={true}
        />
      </Field>

      <MediaUploadField
        label={t(messages.media.fields.avatarLabel)}
        onSelectionChange={handleAvatarSelectionChange}
        error={
          fieldErrors.avatar?.[0]
            ? t(fieldErrors.avatar?.[0] as any)
            : fieldErrors.avatarUrl?.[0]
              ? t(fieldErrors.avatarUrl?.[0] as any)
              : null
        }
        disabled={isBusy}
      />

      <Button
        type="submit"
        disabled={isBusy}
        size={ButtonSizeEnum.md}
        className="w-full"
      >
        {isBusy ? (
          <span className="inline-flex items-center gap-2">
            <Spinner size={16} />
            {t(messages.auth.registering)}
          </span>
        ) : (
          t(messages.auth.createAccount)
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
    <div className="flex justify-center items-center flex-1">
      <Link href="/auth/sign-in" className="underline">
        {t(messages.auth.signInTitle)}
      </Link>
    </div>
  );

  return (
    <AuthView
      title={t(messages.auth.createAccount)}
      description={t(messages.auth.registerSubtitle)}
      form={formEl}
      loading={isBusy}
      topAlertSlot={null}
      dividerLabel={showSocial ? t(messages.auth.orContinueWith) : undefined}
      socialSlot={
        showSocial ? (
          <GoogleButton google={google} disabled={isBusy} />
        ) : undefined
      }
      linksRowSlot={linksRow}
      footerNote={t(messages.auth.agreeNote)}
    />
  );
};
