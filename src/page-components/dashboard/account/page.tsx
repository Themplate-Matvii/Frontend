"use client";

import React, { FormEvent, useEffect, useState } from "react";

import { useAuth, UserApi, type User } from "@/entities/user";
import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import type { MediaItem } from "@/entities/media";

import { ThemeToggle, LanguageSwitcher } from "@/widgets/app-shell/controls";
import Spinner from "@/shared/ui/loading/Spinner";
import { Container } from "@/shared/layout/Container";
import { PageHeader } from "@/shared/layout/PageHeader";
import { P, Small, TextColorEnum } from "@/shared/ui/Typography";
import {
  Button,
  ButtonSizeEnum,
  ButtonVariantEnum,
} from "@/shared/ui/Button";
import Field from "@/shared/ui/forms/Field";
import Input from "@/shared/ui/forms/Input";
import { GoogleButton } from "@/shared/ui/oauth/GoogleButton";
import { LoadingOverlay } from "@/shared/ui/loading/LoadingOverlay";
import { DeleteModal } from "@/shared/ui/modal/DeleteModal";
import { SectionCard } from "@/shared/ui/section/SectionCard";
import { DangerZoneSection } from "@/shared/ui/section/DangerZoneSection";
import { useDeleteWithConfirm } from "@/shared/lib/hooks/useDeleteWithConfirm";
import { PageShell } from "@/shared/layout/PageShell";
import {
  MediaUploadField,
  type MediaUploadSelection,
} from "@/features/media/upload";
import { MediaApi } from "@/entities/media";
import { resolveMediaName } from "@/shared/lib/media";
import { toast } from "@/shared/ui/toast";

export const DashboardAccountPage = () => {
  const { t } = useI18n();
  const { user, refreshUser, logout } = useAuth();
  const updateUser = UserApi.User.useUpdateUser();
  const deleteUser = UserApi.User.useDeleteUser();

  const [name, setName] = useState<string>(user?.name ?? "");
  const [avatar, setAvatar] = useState<MediaItem | null>(user?.avatar ?? null);
  const [avatarSelection, setAvatarSelection] =
    useState<MediaUploadSelection | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const uploadMedia = MediaApi.useUploadMedia();

  const authProviders =
    (user as any)?.authProviders ??
    (user as any)?.providers ??
    [];

  const {
    requestDelete: requestAccountDelete,
    modalProps: accountDeleteModalProps,
  } = useDeleteWithConfirm<User>({
    canDelete: true,
    getLabel: (u) =>
      u.name && u.name.trim().length > 0 ? u.name.trim() : u.email,
    onDelete: async (u) => {
      try {
        await deleteUser.mutateAsync(u.id as string);
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
    const hasAvatarChange = avatar?.id !== user?.avatar?.id || Boolean(avatarSelection);
    if (!name || (!hasNameChange && !hasAvatarChange)) return;

    setUploadError(null);
    setLoading(true);

    let avatarId = avatar?.id;

    if (avatarSelection) {
      try {
        const inferredName = resolveMediaName(avatarSelection, avatarSelection.name || name);
        const { media } = await uploadMedia.mutateAsync({
          file: avatarSelection.type === "file" ? avatarSelection.file : undefined,
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

    updateUser.mutate(
      {
        userId: user?.id || "",
        body: { name, avatar: avatarId },
      },
      {
        onSuccess: async () => {
          await refreshUser();
          toast.success(t(messages.notifications.account.profileSaved));
        },
        onError: (error: any) => {
          const message =
            error?.response?.data?.message || t(messages.errors.generic);
          toast.error(message);
        },
        onSettled: () => {
          setLoading(false);
        },
      },
    );
  };

  useEffect(() => {
    setAvatar(user?.avatar ?? null);
    setAvatarSelection(null);
  }, [user?.avatar]);

  useEffect(() => {
    setName(user?.name ?? "");
  }, [user?.name]);

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
            <SectionCard
              title={t(messages.dashboard.account.profileTitle)}
              description={t(
                messages.dashboard.account.profileDescription,
              )}
            >
              <form
                onSubmit={handleNameSubmit}
                className="space-y-4 relative"
              >
                <LoadingOverlay loading={loading} />

                <Field
                  id="name"
                  label={t(messages.validation.nameLabel)}
                >
                  <Input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(event) =>
                      setName(event.target.value)
                    }
                    placeholder={t(
                      messages.validation.namePlaceholder,
                    )}
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
                />

                <div className="space-y-1">
                  <Small className="uppercase tracking-wide font-medium">
                    {t(messages.auth.email)}
                  </Small>
                  <P className="text-sm font-medium">
                    {user?.email}
                  </P>
                </div>

                <div className="flex justify-end">
                  <Button
                    type="submit"
                    size={ButtonSizeEnum.md}
                    variant={ButtonVariantEnum.primary}
                    disabled={
                      loading ||
                      !name ||
                      (name === user?.name &&
                        avatar?.id === user?.avatar?.id &&
                        !avatarSelection)
                    }
                    className="flex items-center gap-2"
                  >
                    {loading && <Spinner size={16} />}
                    <span>
                      {t(messages.common.actions.saveChanges)}
                    </span>
                  </Button>
                </div>
              </form>
            </SectionCard>

            
          </div>

          <div className="space-y-6 lg:basis-2/5 lg:flex-1">
            <SectionCard
              title={t(messages.dashboard.account.interfaceTitle)}
              description={t(
                messages.dashboard.account.interfaceDescription,
              )}
            >
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <P className="text-sm font-medium">
                      {t(messages.dashboard.account.themeLabel)}
                    </P>
                    <Small>
                      {t(
                        messages.dashboard.account
                          .themeDescription,
                      )}
                    </Small>
                  </div>
                  <ThemeToggle />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <P className="text-sm font-medium">
                      {t(
                        messages.dashboard.account
                          .languageLabel,
                      )}
                    </P>
                    <Small>
                      {t(
                        messages.dashboard.account
                          .languageDescription,
                      )}
                    </Small>
                  </div>
                  <LanguageSwitcher />
                </div>
              </div>
            </SectionCard>
            <SectionCard
              title={t(messages.dashboard.account.authTitle)}
              description={t(
                messages.dashboard.account.authDescription,
              )}
            >
              {Array.isArray(authProviders) &&
              authProviders.length > 0 ? (
                <ul className="space-y-2 text-sm">
                  {authProviders.map(
                    (provider: any, index: number) => {
                      const providerName =
                        (provider.provider ?? provider.name ?? "")
                          .toString()
                          .toLowerCase();

                      if (providerName === "google") {
                        return (
                          <li
                            key={
                              provider.id ??
                              provider.provider ??
                              index
                            }
                            className="flex items-center"
                          >
                            <GoogleButton preview />
                          </li>
                        );
                      }

                      return (
                        <li
                          key={
                            provider.id ??
                            provider.provider ??
                            index
                          }
                          className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2"
                        >
                          <div className="flex flex-col">
                            <P className="text-sm font-medium">
                              {provider.provider ??
                                t(
                                  messages.dashboard.account
                                    .providerFallbackName,
                                )}
                            </P>
                            {provider.displayName && (
                              <Small>
                                {provider.displayName}
                              </Small>
                            )}
                          </div>
                          {provider.createdAt && (
                            <Small>
                              {t(
                                messages.dashboard.account
                                  .providerLinkedPrefix,
                              )}{" "}
                              {new Date(
                                provider.createdAt,
                              ).toLocaleDateString()}
                            </Small>
                          )}
                        </li>
                      );
                    },
                  )}
                </ul>
              ) : (
                <P
                  color={TextColorEnum.Muted}
                  className="text-sm"
                >
                  {t(
                    messages.dashboard.account.providersEmpty,
                  )}
                </P>
              )}
            </SectionCard>

            <DangerZoneSection
              titleKey={
                messages.dashboard.account.delete.title
              }
              descriptionKey={
                messages.dashboard.account.delete.description
              }
              buttonLabelKey={
                messages.dashboard.account.delete.buttonLabel
              }
              onClick={() =>
                user && requestAccountDelete(user as User)
              }
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
