"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";

import { useAuth, UserApi, type User } from "@/entities/identity";
import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import type { MediaItem } from "@/entities/content/media";

import { ThemeToggle, LanguageSwitcher } from "@/widgets/app-shell/controls";
import Spinner from "@/shared/ui/loading/Spinner";
import { Container } from "@/shared/layout/Container";
import { PageHeader } from "@/shared/layout/PageHeader";
import { P, Small, TextColorEnum } from "@/shared/ui/Typography";
import { Button, ButtonSizeEnum, ButtonVariantEnum } from "@/shared/ui/Button";
import Field from "@/shared/ui/forms/Field";
import Input from "@/shared/ui/forms/Input";
import { GoogleButton } from "@/shared/ui/oauth/GoogleButton";
import { LoadingOverlay } from "@/shared/ui/loading/LoadingOverlay";
import { DeleteModal } from "@/shared/ui/modal/DeleteModal";
import { SectionCard } from "@/shared/ui/section/SectionCard";
import { DangerZoneSection } from "@/shared/ui/section/DangerZoneSection";
import { useDeleteWithConfirm } from "@/shared/lib/hooks/useDeleteWithConfirm";
import { PageShell } from "@/shared/layout/PageShell";
import PasswordInput from "@/shared/ui/forms/PasswordInput";
import { Select } from "@/shared/ui/forms/Select";
import {
  MediaUploadField,
  type MediaUploadSelection,
} from "@/features/media/upload";
import { MediaApi } from "@/entities/content/media";
import { resolveMediaName } from "@/shared/lib/media";
import { toast } from "@/shared/ui/toast/toast";
import { useGoogleOAuth } from "@/features/auth/lib/useGoogleOAuth";

const normalizeDateValue = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};

const normalizeNullable = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
};

export const DashboardAccountPage = () => {
  const { t } = useI18n();
  const { user, refreshUser, logout } = useAuth();
  const updateUser = UserApi.User.useUpdateUser();
  const deleteAccount = UserApi.Account.useDeleteAccount();
  const accountQuery = UserApi.Account.useAccountMe();
  const authConfigQuery = UserApi.Account.useAuthConfig();
  const updateAccountProfile = UserApi.Account.useUpdateAccountProfile();
  const linkOAuthProvider = UserApi.Account.useLinkOAuthProvider();
  const unlinkProvider = UserApi.Account.useUnlinkProvider();
  const startEmailProvider = UserApi.Account.useStartEmailProvider();
  const confirmEmailProvider = UserApi.Account.useConfirmEmailProvider();
  const setPassword = UserApi.Account.useSetPassword();
  const changePassword = UserApi.Account.useChangePassword();
  const sendEmailVerification = UserApi.Account.useSendEmailVerification();
  const confirmEmailVerification = UserApi.Account.useConfirmEmailVerification();
  const startEmailChange = UserApi.Account.useStartEmailChange();
  const confirmEmailChange = UserApi.Account.useConfirmEmailChange();

  const [name, setName] = useState<string>(user?.name ?? "");
  const [avatar, setAvatar] = useState<MediaItem | null>(user?.avatar ?? null);
  const [avatarSelection, setAvatarSelection] =
    useState<MediaUploadSelection | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [birthday, setBirthday] = useState("");
  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [emailStart, setEmailStart] = useState("");
  const [emailCode, setEmailCode] = useState("");
  const [passwordNew, setPasswordNew] = useState("");
  const [passwordCurrent, setPasswordCurrent] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [changeEmail, setChangeEmail] = useState("");
  const [changeEmailCode, setChangeEmailCode] = useState("");
  const [profileError, setProfileError] = useState<string | null>(null);

  const uploadMedia = MediaApi.useUploadMedia();

  const account = accountQuery.data;
  const authProviders = account?.authProviders ?? [];
  const enabledProviders =
    authConfigQuery.data?.enabledProviders ??
    account?.enabledAuthProviders ??
    [];

  const {
    requestDelete: requestAccountDelete,
    modalProps: accountDeleteModalProps,
  } = useDeleteWithConfirm<User>({
    canDelete: true,
    getLabel: () => "DELETE",
    onDelete: async (u) => {
      try {
        await deleteAccount.mutateAsync();
        toast.success(t(messages.notifications.account.deleteSuccess));
        await logout();
      } catch (error: any) {
        const message =
          error?.response?.data?.message || t(messages.errors.generic);
        toast.error(message);
      }
    },
  });

  const handleNameSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const hasNameChange = name !== (user?.name ?? "");
    const hasAvatarChange =
      avatar?.id !== user?.avatar?.id || Boolean(avatarSelection);
    const hasProfileChange =
      normalizeDateValue(birthday) !==
        normalizeDateValue(account?.birthday ?? undefined) ||
      phone !== (account?.phone ?? "") ||
      country !== (account?.country ?? "") ||
      timezone !== (account?.timezone ?? "");

    if (!hasNameChange && !hasAvatarChange && !hasProfileChange) {
      return;
    }

    setUploadError(null);
    setProfileError(null);
    setLoading(true);

    let avatarId = avatar?.id;

    if (avatarSelection) {
      try {
        const inferredName = resolveMediaName(
          avatarSelection,
          avatarSelection.name || name,
        );
        const { media } = await uploadMedia.mutateAsync({
          file:
            avatarSelection.type === "file" ? avatarSelection.file : undefined,
          url: avatarSelection.type === "url" ? avatarSelection.url : undefined,
          name: inferredName || undefined,
        });
        avatarId = media.id;
        setAvatar(media);
        setAvatarSelection(null);
      } catch (err: any) {
        const message = err?.response?.data?.message as string;
        setUploadError(message || t(messages.errors.generic));
        toast.error(message || t(messages.errors.generic));
        setLoading(false);
        return;
      }
    }

    try {
      if (hasNameChange || hasAvatarChange) {
        await updateUser.mutateAsync({
          userId: user?.id || "",
          body: { name, avatar: avatarId },
        });
        await refreshUser();
      }

      if (hasProfileChange) {
        await updateAccountProfile.mutateAsync({
          birthday: birthday ? birthday : null,
          phone: normalizeNullable(phone),
          country: normalizeNullable(country),
          timezone: normalizeNullable(timezone),
        });
      }

      toast.success(t(messages.notifications.account.profileSaved));
    } catch (error: any) {
      const message =
        error?.response?.data?.message || t(messages.errors.generic);
      setProfileError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setAvatar(user?.avatar ?? null);
    setAvatarSelection(null);
  }, [user?.avatar]);

  useEffect(() => {
    setName(user?.name ?? "");
  }, [user?.name]);

  useEffect(() => {
    if (!account) return;
    setBirthday(normalizeDateValue(account.birthday ?? undefined));
    setPhone(account.phone ?? "");
    setCountry(account.country ?? "");
    setTimezone(
      account.timezone ??
        (typeof Intl !== "undefined"
          ? Intl.DateTimeFormat().resolvedOptions().timeZone ?? ""
          : ""),
    );
  }, [account]);

  const countryOptions = useMemo(() => {
    // const regions =
    //   typeof Intl !== "undefined" && "supportedValuesOf" in Intl
    //     ? (Intl.supportedValuesOf("region") as string[])
    //     : [];
    const regions: any[] = [];
    const displayNames =
      typeof Intl !== "undefined" && "DisplayNames" in Intl
        ? new Intl.DisplayNames([user?.settings?.locale ?? "en"], {
            type: "region",
          })
        : null;
    const options = regions
      .map((region) => ({
        value: region,
        label: displayNames?.of(region) ?? region,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
    return [{ value: "", label: t(messages.common.actions.select) }, ...options];
  }, [t, user?.settings?.locale]);

  const timezoneOptions = useMemo(() => {
    const zones =
      typeof Intl !== "undefined" && "supportedValuesOf" in Intl
        ? (Intl.supportedValuesOf("timeZone") as string[])
        : [];
    const options = zones.map((zone) => ({ value: zone, label: zone }));
    return [{ value: "", label: t(messages.common.actions.select) }, ...options];
  }, [t]);

  const connectedCount = authProviders.length;
  const hasEmailProvider = authProviders.some(
    (provider) => provider.provider === "email",
  );
  const isEmailVerified = account?.emailVerified ?? false;
  const hasPassword = account?.hasPassword ?? false;
  const hasProfileChanges = useMemo(() => {
    const hasNameChange = name !== (user?.name ?? "");
    const hasAvatarChange =
      avatar?.id !== user?.avatar?.id || Boolean(avatarSelection);
    const hasProfileChange =
      normalizeDateValue(birthday) !==
        normalizeDateValue(account?.birthday ?? undefined) ||
      phone !== (account?.phone ?? "") ||
      country !== (account?.country ?? "") ||
      timezone !== (account?.timezone ?? "");
    return hasNameChange || hasAvatarChange || hasProfileChange;
  }, [
    name,
    user?.name,
    avatar?.id,
    user?.avatar?.id,
    avatarSelection,
    birthday,
    account?.birthday,
    phone,
    account?.phone,
    country,
    account?.country,
    timezone,
    account?.timezone,
  ]);
  const providerLabels = useMemo(
    () => ({
      email: t(messages.dashboard.account.providers.email),
      google: t(messages.dashboard.account.providers.google),
      apple: t(messages.dashboard.account.providers.apple),
      github: t(messages.dashboard.account.providers.github),
    }),
    [t],
  );

  const googleOAuth = useGoogleOAuth({
    clientId: authConfigQuery.data?.oauth?.googleClientId ?? "",
    onCode: async (code) => {
      try {
        await linkOAuthProvider.mutateAsync({
          provider: "google",
          code,
        });
        toast.success(t(messages.notifications.account.providerLinked));
      } catch (error: any) {
        const message =
          error?.response?.data?.message || t(messages.errors.generic);
        toast.error(message);
      }
    },
  });

  const handleDisconnectProvider = async (provider: string) => {
    try {
      await unlinkProvider.mutateAsync(provider);
      toast.success(t(messages.notifications.account.providerUnlinked));
    } catch (error: any) {
      const message =
        error?.response?.data?.message || t(messages.errors.generic);
      toast.error(message);
    }
  };

  const handleSendVerification = async () => {
    try {
      await sendEmailVerification.mutateAsync();
      toast.success(t(messages.notifications.account.codeSent));
    } catch (error: any) {
      const message =
        error?.response?.data?.message || t(messages.errors.generic);
      toast.error(message);
    }
  };

  const handleConfirmVerification = async () => {
    if (!verificationCode.trim()) return;
    try {
      await confirmEmailVerification.mutateAsync({
        code: verificationCode.trim(),
      });
      setVerificationCode("");
      toast.success(t(messages.notifications.account.emailVerified));
    } catch (error: any) {
      const message =
        error?.response?.data?.message || t(messages.errors.generic);
      toast.error(message);
    }
  };

  const handleEmailStart = async () => {
    if (!emailStart.trim()) return;
    try {
      await startEmailProvider.mutateAsync({ email: emailStart.trim() });
      toast.success(t(messages.notifications.account.codeSent));
    } catch (error: any) {
      const message =
        error?.response?.data?.message || t(messages.errors.generic);
      toast.error(message);
    }
  };

  const handleEmailConfirm = async () => {
    if (!emailStart.trim() || !emailCode.trim()) return;
    try {
      await confirmEmailProvider.mutateAsync({
        email: emailStart.trim(),
        code: emailCode.trim(),
      });
      setEmailCode("");
      toast.success(t(messages.notifications.account.emailLinked));
    } catch (error: any) {
      const message =
        error?.response?.data?.message || t(messages.errors.generic);
      toast.error(message);
    }
  };

  const handleSetPassword = async () => {
    if (!passwordNew.trim() || passwordNew !== passwordConfirm) return;
    try {
      await setPassword.mutateAsync({ newPassword: passwordNew });
      setPasswordNew("");
      setPasswordConfirm("");
      toast.success(t(messages.notifications.account.passwordSet));
    } catch (error: any) {
      const message =
        error?.response?.data?.message || t(messages.errors.generic);
      toast.error(message);
    }
  };

  const handleChangePassword = async () => {
    if (
      !passwordCurrent.trim() ||
      !passwordNew.trim() ||
      passwordNew !== passwordConfirm
    ) {
      return;
    }
    try {
      await changePassword.mutateAsync({
        currentPassword: passwordCurrent,
        newPassword: passwordNew,
      });
      setPasswordCurrent("");
      setPasswordNew("");
      setPasswordConfirm("");
      toast.success(t(messages.notifications.account.passwordChanged));
    } catch (error: any) {
      const message =
        error?.response?.data?.message || t(messages.errors.generic);
      toast.error(message);
    }
  };

  const handleChangeEmailStart = async () => {
    if (!changeEmail.trim()) return;
    try {
      await startEmailChange.mutateAsync({ newEmail: changeEmail.trim() });
      toast.success(t(messages.notifications.account.codeSent));
    } catch (error: any) {
      const message =
        error?.response?.data?.message || t(messages.errors.generic);
      toast.error(message);
    }
  };

  const handleChangeEmailConfirm = async () => {
    if (!changeEmail.trim() || !changeEmailCode.trim()) return;
    try {
      await confirmEmailChange.mutateAsync({
        newEmail: changeEmail.trim(),
        code: changeEmailCode.trim(),
      });
      setChangeEmailCode("");
      toast.success(t(messages.notifications.account.emailChanged));
    } catch (error: any) {
      const message =
        error?.response?.data?.message || t(messages.errors.generic);
      toast.error(message);
    }
  };

  return (
    <PageShell>
      <Container>
        <PageHeader
          title={t(messages.dashboard.account.title)}
          subtitle={t(messages.dashboard.account.subtitle)}
          subtitleColor={TextColorEnum.Secondary}
        />

        <section className="flex flex-col gap-8 lg:flex-row">
          <div className="space-y-6 lg:basis-3/5 lg:flex-1">
            <LoadingOverlay
              loading={loading || accountQuery.isLoading}
              className="rounded-xl"
            >
              <SectionCard
                title={t(messages.dashboard.account.profileTitle)}
                description={t(messages.dashboard.account.profileDescription)}
              >
                <form onSubmit={handleNameSubmit} className="space-y-4">
                  <Field id="name" label={t(messages.validation.nameLabel)}>
                    <Input
                      id="name"
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder={t(messages.validation.namePlaceholder)}
                    />
                  </Field>

                  <MediaUploadField
                    label={t(messages.media.fields.avatarLabel)}
                    savedMedia={avatar}
                    onSavedChange={(media) => {
                      setAvatar(media);
                      setAvatarSelection(null);
                    }}
                    onSelectionChange={(selection) => {
                      setAvatarSelection(selection);
                      setUploadError(null);
                    }}
                    error={uploadError}
                    disabled={loading || uploadMedia.isPending}
                    isUploading={uploadMedia.isPending}
                  />

                  <div className="space-y-1">
                    <Small className="uppercase tracking-wide font-medium">
                      {t(messages.auth.email)}
                    </Small>
                    <P className="text-sm font-medium">{user?.email}</P>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field
                      id="birthday"
                      label={t(messages.dashboard.account.birthdayLabel)}
                    >
                      <Input
                        id="birthday"
                        type="date"
                        value={birthday}
                        onChange={(event) => setBirthday(event.target.value)}
                      />
                    </Field>

                    <Field
                      id="phone"
                      label={t(messages.dashboard.account.phoneLabel)}
                    >
                      <Input
                        id="phone"
                        type="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value)}
                        placeholder="+12025550123"
                      />
                    </Field>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field
                      id="country"
                      label={t(messages.dashboard.account.countryLabel)}
                    >
                      <Select
                        id="country"
                        value={country}
                        onChange={(value) => setCountry(value as string)}
                        options={countryOptions}
                      />
                    </Field>

                    <Field
                      id="timezone"
                      label={t(messages.dashboard.account.timezoneLabel)}
                    >
                      <Select
                        id="timezone"
                        value={timezone}
                        onChange={(value) => setTimezone(value as string)}
                        options={timezoneOptions}
                      />
                    </Field>
                  </div>

                  {profileError && (
                    <Small color={TextColorEnum.Danger}>
                      {profileError}
                    </Small>
                  )}

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      size={ButtonSizeEnum.md}
                      variant={ButtonVariantEnum.primary}
                      disabled={loading || !hasProfileChanges}
                      className="flex items-center gap-2"
                    >
                      {loading && <Spinner size={16} />}
                      <span>{t(messages.common.actions.saveChanges)}</span>
                    </Button>
                  </div>
                </form>
              </SectionCard>
            </LoadingOverlay>

            <SectionCard
              title={t(messages.dashboard.account.securityTitle)}
              description={t(messages.dashboard.account.securityDescription)}
            >
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <P className="text-sm font-medium">
                        {t(messages.dashboard.account.providersTitle)}
                      </P>
                      <Small color={TextColorEnum.Muted}>
                        {t(messages.dashboard.account.providersDescription)}
                      </Small>
                    </div>
                  </div>
                  {enabledProviders.length === 0 ? (
                    <P color={TextColorEnum.Muted} className="text-sm">
                      {t(messages.dashboard.account.providersEmpty)}
                    </P>
                  ) : (
                    <ul className="space-y-2">
                      {enabledProviders.map((provider) => {
                        const connected = authProviders.some(
                          (item) => item.provider === provider,
                        );
                        const canDisconnect = connected && connectedCount > 1;
                        const isGoogle = provider === "google";
                        const isEmail = provider === "email";
                        return (
                          <li
                            key={provider}
                            className="flex flex-col gap-3 rounded-md border border-border bg-background px-3 py-3 md:flex-row md:items-center md:justify-between"
                          >
                            <div className="space-y-1">
                              <P className="text-sm font-medium capitalize">
                                {providerLabels[provider] ?? provider}
                              </P>
                              <Small
                                color={
                                  connected
                                    ? TextColorEnum.Success
                                    : TextColorEnum.Muted
                                }
                              >
                                {connected
                                  ? t(
                                      messages.dashboard.account
                                        .providerConnected,
                                    )
                                  : t(
                                      messages.dashboard.account
                                        .providerNotConnected,
                                    )}
                              </Small>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                              {connected ? (
                                <Button
                                  type="button"
                                  size={ButtonSizeEnum.sm}
                                  variant={ButtonVariantEnum.secondary}
                                  onClick={() =>
                                    handleDisconnectProvider(provider)
                                  }
                                  disabled={!canDisconnect}
                                >
                                  {t(
                                    messages.dashboard.account
                                      .providerDisconnect,
                                  )}
                                </Button>
                              ) : isGoogle ? (
                                <GoogleButton
                                  google={googleOAuth}
                                  disabled={!googleOAuth.isReady}
                                />
                              ) : isEmail ? (
                                <Button
                                  type="button"
                                  size={ButtonSizeEnum.sm}
                                  variant={ButtonVariantEnum.secondary}
                                  disabled
                                >
                                  {t(
                                    messages.dashboard.account
                                      .providerManageBelow,
                                  )}
                                </Button>
                              ) : (
                                <Button
                                  type="button"
                                  size={ButtonSizeEnum.sm}
                                  variant={ButtonVariantEnum.secondary}
                                  disabled
                                >
                                  {t(
                                    messages.dashboard.account
                                      .providerComingSoon,
                                  )}
                                </Button>
                              )}
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {hasEmailProvider && (
                  <div className="space-y-3">
                    <div>
                      <P className="text-sm font-medium">
                        {t(messages.dashboard.account.emailVerificationTitle)}
                      </P>
                      <Small color={TextColorEnum.Muted}>
                        {isEmailVerified
                          ? t(
                              messages.dashboard.account
                                .emailVerificationVerified,
                            )
                          : t(
                              messages.dashboard.account
                                .emailVerificationPending,
                            )}
                      </Small>
                    </div>

                    {!isEmailVerified && (
                      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                        <Input
                          value={verificationCode}
                          onChange={(event) =>
                            setVerificationCode(event.target.value)
                          }
                          placeholder={t(
                            messages.dashboard.account.codePlaceholder,
                          )}
                        />
                        <div className="flex flex-wrap gap-2">
                          <Button
                            type="button"
                            size={ButtonSizeEnum.sm}
                            variant={ButtonVariantEnum.secondary}
                            onClick={handleSendVerification}
                          >
                            {t(messages.dashboard.account.sendCode)}
                          </Button>
                          <Button
                            type="button"
                            size={ButtonSizeEnum.sm}
                            variant={ButtonVariantEnum.primary}
                            onClick={handleConfirmVerification}
                          >
                            {t(messages.dashboard.account.confirmCode)}
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {!hasEmailProvider && (
                  <div className="space-y-3">
                    <div>
                      <P className="text-sm font-medium">
                        {t(messages.dashboard.account.addEmailTitle)}
                      </P>
                      <Small color={TextColorEnum.Muted}>
                        {t(messages.dashboard.account.addEmailDescription)}
                      </Small>
                    </div>
                    <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                      <Input
                        value={emailStart}
                        onChange={(event) => setEmailStart(event.target.value)}
                        placeholder={t(messages.auth.emailPlaceholder)}
                        type="email"
                      />
                      <Button
                        type="button"
                        size={ButtonSizeEnum.sm}
                        variant={ButtonVariantEnum.secondary}
                        onClick={handleEmailStart}
                      >
                        {t(messages.dashboard.account.sendCode)}
                      </Button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                      <Input
                        value={emailCode}
                        onChange={(event) => setEmailCode(event.target.value)}
                        placeholder={t(messages.dashboard.account.codePlaceholder)}
                      />
                      <Button
                        type="button"
                        size={ButtonSizeEnum.sm}
                        variant={ButtonVariantEnum.primary}
                        onClick={handleEmailConfirm}
                      >
                        {t(messages.dashboard.account.confirmCode)}
                      </Button>
                    </div>
                  </div>
                )}

                {hasEmailProvider && !hasPassword && (
                  <div className="space-y-3">
                    <div>
                      <P className="text-sm font-medium">
                        {t(messages.dashboard.account.setPasswordTitle)}
                      </P>
                      <Small color={TextColorEnum.Muted}>
                        {t(messages.dashboard.account.setPasswordDescription)}
                      </Small>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <PasswordInput
                        value={passwordNew}
                        onChange={(event) =>
                          setPasswordNew(event.target.value)
                        }
                        placeholder={t(messages.auth.passwordPlaceholder)}
                        autoComplete="new-password"
                        showStrength
                        showGenerateStrength
                      />
                      <PasswordInput
                        value={passwordConfirm}
                        onChange={(event) =>
                          setPasswordConfirm(event.target.value)
                        }
                        placeholder={t(messages.auth.confirmPassword)}
                        autoComplete="new-password"
                      />
                    </div>
                    <Button
                      type="button"
                      size={ButtonSizeEnum.sm}
                      variant={ButtonVariantEnum.primary}
                      onClick={handleSetPassword}
                      disabled={
                        !passwordNew ||
                        !passwordConfirm ||
                        passwordNew !== passwordConfirm
                      }
                    >
                      {t(messages.dashboard.account.setPasswordAction)}
                    </Button>
                  </div>
                )}

                {hasEmailProvider && hasPassword && (
                  <div className="space-y-3">
                    <div>
                      <P className="text-sm font-medium">
                        {t(messages.dashboard.account.changePasswordTitle)}
                      </P>
                      <Small color={TextColorEnum.Muted}>
                        {t(messages.dashboard.account.changePasswordDescription)}
                      </Small>
                    </div>
                    <div className="grid gap-3 md:grid-cols-3">
                      <PasswordInput
                        value={passwordCurrent}
                        onChange={(event) =>
                          setPasswordCurrent(event.target.value)
                        }
                        placeholder={t(messages.dashboard.account.currentPassword)}
                        autoComplete="current-password"
                      />
                      <PasswordInput
                        value={passwordNew}
                        onChange={(event) =>
                          setPasswordNew(event.target.value)
                        }
                        placeholder={t(messages.auth.passwordPlaceholder)}
                        autoComplete="new-password"
                        showStrength
                        showGenerateStrength
                      />
                      <PasswordInput
                        value={passwordConfirm}
                        onChange={(event) =>
                          setPasswordConfirm(event.target.value)
                        }
                        placeholder={t(messages.auth.confirmPassword)}
                        autoComplete="new-password"
                      />
                    </div>
                    <Button
                      type="button"
                      size={ButtonSizeEnum.sm}
                      variant={ButtonVariantEnum.primary}
                      onClick={handleChangePassword}
                      disabled={
                        !passwordCurrent ||
                        !passwordNew ||
                        !passwordConfirm ||
                        passwordNew !== passwordConfirm
                      }
                    >
                      {t(messages.dashboard.account.changePasswordAction)}
                    </Button>
                  </div>
                )}

                {hasEmailProvider && (
                  <div className="space-y-3">
                    <div>
                      <P className="text-sm font-medium">
                        {t(messages.dashboard.account.changeEmailTitle)}
                      </P>
                      <Small color={TextColorEnum.Muted}>
                        {t(messages.dashboard.account.changeEmailDescription)}
                      </Small>
                    </div>
                    <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                      <Input
                        type="email"
                        value={changeEmail}
                        onChange={(event) => setChangeEmail(event.target.value)}
                        placeholder={t(messages.dashboard.account.newEmailPlaceholder)}
                      />
                      <Button
                        type="button"
                        size={ButtonSizeEnum.sm}
                        variant={ButtonVariantEnum.secondary}
                        onClick={handleChangeEmailStart}
                      >
                        {t(messages.dashboard.account.sendCode)}
                      </Button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                      <Input
                        value={changeEmailCode}
                        onChange={(event) =>
                          setChangeEmailCode(event.target.value)
                        }
                        placeholder={t(messages.dashboard.account.codePlaceholder)}
                      />
                      <Button
                        type="button"
                        size={ButtonSizeEnum.sm}
                        variant={ButtonVariantEnum.primary}
                        onClick={handleChangeEmailConfirm}
                      >
                        {t(messages.dashboard.account.confirmCode)}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </SectionCard>
          </div>

          <div className="space-y-6 lg:basis-2/5 lg:flex-1">
            <SectionCard
              title={t(messages.dashboard.account.interfaceTitle)}
              description={t(messages.dashboard.account.interfaceDescription)}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <P className="text-sm font-medium">
                      {t(messages.dashboard.account.themeLabel)}
                    </P>
                    <Small>
                      {t(messages.dashboard.account.themeDescription)}
                    </Small>
                  </div>
                  <ThemeToggle />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <P className="text-sm font-medium">
                      {t(messages.dashboard.account.languageLabel)}
                    </P>
                    <Small>
                      {t(messages.dashboard.account.languageDescription)}
                    </Small>
                  </div>
                  <LanguageSwitcher />
                </div>
              </div>
            </SectionCard>
            <DangerZoneSection
              titleKey={messages.dashboard.account.delete.title}
              descriptionKey={messages.dashboard.account.delete.description}
              buttonLabelKey={messages.dashboard.account.delete.buttonLabel}
              onClick={() => user && requestAccountDelete(user as User)}
            />
          </div>
        </section>
      </Container>

      <DeleteModal
        open={accountDeleteModalProps.open}
        onClose={accountDeleteModalProps.onClose}
        requiredValue={accountDeleteModalProps.requiredValue}
        onConfirm={accountDeleteModalProps.onConfirm}
      />
    </PageShell>
  );
};
