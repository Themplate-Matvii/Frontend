"use client";

import React, { FormEvent, useEffect, useMemo, useState } from "react";
import { getTimeZones } from "@vvo/tzdb";
import countries from "i18n-iso-countries";
import enCountries from "i18n-iso-countries/langs/en.json";

import { useAuth, UserApi } from "@/entities/identity";
import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import type { MediaItem } from "@/entities/content/media";

import Spinner from "@/shared/ui/loading/Spinner";
import { Container } from "@/shared/layout/Container";
import { PageHeader } from "@/shared/layout/PageHeader";
import { PageShell } from "@/shared/layout/PageShell";
import { P, Small, TextColorEnum } from "@/shared/ui/Typography";
import { Button, ButtonSizeEnum, ButtonVariantEnum } from "@/shared/ui/Button";
import Field from "@/shared/ui/forms/Field";
import Input from "@/shared/ui/forms/Input";
import { LoadingOverlay } from "@/shared/ui/loading/LoadingOverlay";
import { SectionCard } from "@/shared/ui/section/SectionCard";
import { Select } from "@/shared/ui/forms/Select";
import {
  MediaUploadField,
  type MediaUploadSelection,
} from "@/features/media/upload";
import { MediaApi } from "@/entities/content/media";
import { resolveMediaName } from "@/shared/lib/media";
import { toast } from "@/shared/ui/toast/toast";
import { normalizeNullable } from "@/shared/lib/strings";

// ✅ add DatePicker import (path adjust to where you placed this component)
import { DatePicker } from "@/shared/ui/forms/DatePicker";

countries.registerLocale(enCountries as any);

function formatDateOnly(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function parseDate(value?: string | null) {
  if (!value) return undefined;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? undefined : d;
}

export const DashboardAccountProfilePage = () => {
  const { t } = useI18n();
  const { user, refreshUser } = useAuth();

  const updateUser = UserApi.User.useUpdateUser();
  const accountQuery = UserApi.Account.useAccountMe();
  const updateAccountProfile = UserApi.Account.useUpdateAccountProfile();

  const uploadMedia = MediaApi.useUploadMedia();
  const account = accountQuery.data;

  const [name, setName] = useState<string>(user?.name ?? "");
  const [avatar, setAvatar] = useState<MediaItem | null>(user?.avatar ?? null);
  const [avatarSelection, setAvatarSelection] =
    useState<MediaUploadSelection | null>(null);

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [phone, setPhone] = useState("");
  const [country, setCountry] = useState("");
  const [timezone, setTimezone] = useState("");

  // ✅ birthday state
  const [birthday, setBirthday] = useState<Date | undefined>(undefined);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();

    const hasNameChange = name !== (user?.name ?? "");
    const hasAvatarChange =
      avatar?.id !== user?.avatar?.id || Boolean(avatarSelection);

    const currentBirthday = account?.birthday ?? "";
    const nextBirthday = birthday ? formatDateOnly(birthday) : "";

    const hasProfileChange =
      phone !== (account?.phone ?? "") ||
      country !== (account?.country ?? "") ||
      timezone !== (account?.timezone ?? "") ||
      nextBirthday !==
        (currentBirthday
          ? formatDateOnly(
              parseDate(currentBirthday) ?? new Date(currentBirthday),
            )
          : "");

    if (!hasNameChange && !hasAvatarChange && !hasProfileChange) return;

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
          phone: normalizeNullable(phone),
          country: normalizeNullable(country),
          timezone: normalizeNullable(timezone),
          // ✅ send birthday (YYYY-MM-DD) or null
          birthday: normalizeNullable(birthday ? formatDateOnly(birthday) : ""),
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

    setPhone(account.phone ?? "");
    setCountry(account.country ?? "");
    setTimezone(
      account.timezone ??
        (typeof Intl !== "undefined"
          ? Intl.DateTimeFormat().resolvedOptions().timeZone ?? ""
          : ""),
    );

    // ✅ init birthday from account
    setBirthday(parseDate(account.birthday));
  }, [account]);

  const countryOptions = useMemo(() => {
    const placeholder = { value: "", label: t(messages.common.actions.select) };

    const names =
      countries.getNames("en", { select: "official" }) ??
      ({} as Record<string, string>);

    const options = Object.entries(names)
      .map(([code, label]) => ({ value: code, label }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return [placeholder, ...options];
  }, [t]);

  const timezoneOptions = useMemo(() => {
    const placeholder = { value: "", label: t(messages.common.actions.select) };

    const options = getTimeZones()
      .map((zone) => ({
        value: zone.name,
        label: zone.name,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    return [placeholder, ...options];
  }, [t]);

  const hasProfileChanges = useMemo(() => {
    const hasNameChange = name !== (user?.name ?? "");
    const hasAvatarChange =
      avatar?.id !== user?.avatar?.id || Boolean(avatarSelection);

    const currentBirthday = account?.birthday ?? "";
    const nextBirthday = birthday ? formatDateOnly(birthday) : "";
    const accountBirthday = currentBirthday
      ? formatDateOnly(parseDate(currentBirthday) ?? new Date(currentBirthday))
      : "";

    const hasProfileChange =
      phone !== (account?.phone ?? "") ||
      country !== (account?.country ?? "") ||
      timezone !== (account?.timezone ?? "") ||
      nextBirthday !== accountBirthday;

    return hasNameChange || hasAvatarChange || hasProfileChange;
  }, [
    name,
    user?.name,
    avatar?.id,
    user?.avatar?.id,
    avatarSelection,
    phone,
    account?.phone,
    country,
    account?.country,
    timezone,
    account?.timezone,
    birthday,
    account?.birthday,
  ]);

  return (
    <LoadingOverlay
      loading={loading || accountQuery.isLoading}
      className="rounded-xl"
    >
      <SectionCard
        title={t(messages.dashboard.account.profileTitle)}
        description={t(messages.dashboard.account.profileDescription)}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <Field id="phone" label={t(messages.dashboard.account.phoneLabel)}>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="+12025550123"
              />
            </Field>
            <Field
              id="birthday"
              label={t(messages.dashboard.account.birthdayLabel)}
            >
              <DatePicker
                id="birthday"
                placeholder="Select date"
                value={birthday}
                onChange={(value) => setBirthday(value)}
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
                isSearchable
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
                isSearchable
              />
            </Field>
          </div>

          {profileError && (
            <Small color={TextColorEnum.Danger}>{profileError}</Small>
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
  );
};
