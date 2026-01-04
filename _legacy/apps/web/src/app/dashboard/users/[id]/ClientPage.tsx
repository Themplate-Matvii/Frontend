"use client";

import React, { FormEvent, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import { useAuth } from "@packages/api/context/AuthContext";
import {
  useUserById,
  useUpdateUser,
  useDeleteUser,
} from "@packages/api/modules/user/index/queries";
import { User, UserRoleEnum } from "@packages/api/modules/user/index/types";
import { messages, useI18n } from "@packages/locales";
import {
  useUserSubscription,
  useCancelUserSubscription,
  useResumeUserSubscription,
} from "@packages/api/modules/billing/subscriptions";
import { useUserPayments } from "@packages/api/modules/billing/payments";
import { useAdjustUserBonus, useUserBonusHistory } from "@packages/api/modules/bonus";

import { Container } from "@/shared/layout/Container";
import { PageHeader } from "@/shared/layout/PageHeader";
import { PageShell } from "@/shared/layout/PageShell";
import Spinner from "@/shared/ui/loading/Spinner";
import { P, Small, TextColorEnum } from "@/shared/ui/Typography";
import {
  Button,
  ButtonSizeEnum,
  ButtonVariantEnum,
} from "@/shared/ui/Button";
import Field from "@/shared/ui/forms/Field";
import Input from "@/shared/ui/forms/Input";
import { DeleteModal } from "@/shared/ui/modal/DeleteModal";
import { SectionCard } from "@/shared/ui/section/SectionCard";
import { DangerZoneSection } from "@/shared/ui/section/DangerZoneSection";
import { useDeleteWithConfirm } from "@/hooks/entities/useDeleteWithConfirm";
import { useAppPermissions } from "@/hooks/auth/usePermissions";
import { usePermissionGuard } from "@/hooks/auth/usePermissionGuard";
import { CurrentSubscriptionSection } from "@/shared/components/billing/CurrentSubscriptionSection";
import { PaymentsSection } from "@/shared/components/billing/PaymentsSection";
import { BonusSection } from "@/shared/components/billing/BonusSection";
import { getProductLabel } from "@/app/dashboard/subscription/utils/billing";
import {
  MediaUploadField,
  type MediaUploadSelection,
} from "@/shared/components/media/MediaUploadField";
import type { MediaItem } from "@packages/api/modules/assets/media";
import { useUploadMedia } from "@packages/api/modules/assets/media";
import { resolveMediaName } from "@/shared/lib/media";

export default function UserDetailClientPage() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useParams<{ id: string }>();
  const userId = params?.id;

  const { user: currentUser, loading: authLoading } = useAuth();
  const { users: usersPermissions, subscriptions: subscriptionPermissions, payments, bonus } =
    useAppPermissions();

  const canViewAnyUsers = usersPermissions.any.view;
  const canEditAnyUsers = usersPermissions.any.edit;
  const canDeleteAnyUsers = usersPermissions.any.delete;
  const canViewSubscriptions = subscriptionPermissions.any.view;
  const canManageSubscriptions = subscriptionPermissions.any.manage;
  const canViewPayments = payments.any.view;
  const canViewBonus = bonus.history.any.view;
  const canAdjustBonus = bonus.adjust;
  const { canAccess } = usePermissionGuard({
    canAccess: canViewAnyUsers,
  });

  const {
    data: viewedUser,
    isLoading,
    isError,
    refetch,
  } = useUserById(userId);

  const { data: subscriptionData, isLoading: subscriptionLoading } = useUserSubscription(
    userId,
    { enabled: canViewSubscriptions },
  );

  const { data: userPayments = [], isLoading: userPaymentsLoading } = useUserPayments(
    userId,
    { enabled: canViewPayments },
  );

  const { data: userBonus = [], isLoading: userBonusLoading } = useUserBonusHistory(
    userId,
    { enabled: canViewBonus },
  );

  const adjustUserBonus = useAdjustUserBonus();

  const [name, setName] = useState<string>("");
  const [avatar, setAvatar] = useState<MediaItem | null>(null);
  const [avatarSelection, setAvatarSelection] =
    useState<MediaUploadSelection | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [aiCreditsValue, setAiCreditsValue] = useState<string>("");
  const [bonusError, setBonusError] = useState<string | null>(null);

  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const uploadMedia = useUploadMedia();
  const cancelUserSubscription = useCancelUserSubscription();
  const resumeUserSubscription = useResumeUserSubscription();

  const roleLabel = viewedUser?.role?.key
    ? viewedUser.role.key === UserRoleEnum.ADMIN
      ? t(messages.roles.admin.name)
      : t(messages.roles.user.name)
    : viewedUser?.role?.name ?? viewedUser?.role?.key;
  const planLabel = getProductLabel(t, viewedUser?.plan);

  useEffect(() => {
    if (viewedUser?.name) {
      setName(viewedUser.name);
    } else if (viewedUser?.email) {
      setName(viewedUser.email);
    }
    setAvatar(viewedUser?.avatar ?? null);
    setAvatarSelection(null);
    setAiCreditsValue(
      typeof viewedUser?.aiCredits === "number" ? String(viewedUser.aiCredits) : "0",
    );
  }, [viewedUser]);

  useEffect(() => {
    if (!authLoading && currentUser && userId && currentUser.id === userId) {
      router.replace("/dashboard/account");
    }
  }, [authLoading, currentUser, userId, router]);

  const {
    modalProps: deleteModalProps,
    requestDelete: requestUserDelete,
    isPending: deletePending,
  } = useDeleteWithConfirm<User>({
    canDelete: canDeleteAnyUsers,
    getLabel: (u) =>
      u.name && u.name.trim().length > 0 ? u.name.trim() : u.email,
    onDelete: async (u) => {
      await deleteUserMutation.mutateAsync(u.id);
      router.push("/dashboard/users");
    },
  });

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!viewedUser || !canEditAnyUsers) return;
    const hasNameChange = name !== (viewedUser.name ?? "");
    const hasAvatarChange =
      avatar?.id !== viewedUser.avatar?.id || Boolean(avatarSelection);
    if (!name || (!hasNameChange && !hasAvatarChange)) return;

    setUploadError(null);
    setSaving(true);

    let avatarId = avatar?.id;

    if (avatarSelection) {
      try {
        const inferredName = resolveMediaName(
          avatarSelection,
          avatarSelection.name || name,
        );
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
        setSaving(false);
        return;
      }
    }

    updateUserMutation.mutate(
      {
        userId: viewedUser.id,
        body: { name, avatar: avatarId },
      },
      {
        onSuccess: ({ data }: { data: User }) => {
          setName(data.name ?? "");
          setAvatar(data.avatar ?? null);
        },
        onSettled: () => {
          setSaving(false);
        },
      },
    );
  };

  const handleCancelSubscription = () => {
    if (!userId || !canManageSubscriptions || !subscriptionData?.subscription) return;
    cancelUserSubscription.mutate(userId);
  };

  const handleResumeSubscription = () => {
    if (!userId || !canManageSubscriptions || !subscriptionData?.subscription) return;
    resumeUserSubscription.mutate(userId);
  };

  const handleAdjustBonus = async (event: FormEvent) => {
    event.preventDefault();
    if (!userId || !canAdjustBonus) return;

    const parsedCredits = Number(aiCreditsValue);
    if (Number.isNaN(parsedCredits) || parsedCredits < 0) {
      setBonusError(t(messages.dashboard.users.detail.bonusAdjust.invalidValue));
      return;
    }

    setBonusError(null);

    adjustUserBonus.mutate(
      { userId, body: { aiCredits: parsedCredits } },
      {
        onError: (error: any) => {
          const message = error?.response?.data?.message as string;
          setBonusError(message || t(messages.errors.generic));
        },
      },
    );
  };

  const loading = authLoading || isLoading;

  const showContent =
    !loading &&
    !isError &&
    !!viewedUser &&
    canViewAnyUsers &&
    (!currentUser || currentUser.id !== userId);

  if (!canAccess && !authLoading) {
    return null;
  }
  
  return (
    <PageShell>
      <Container className="py-8 space-y-6">
        <PageHeader
          title={t(messages.dashboard.users.detail.title)}
          subtitle={t(messages.dashboard.users.detail.subtitle)}
          onBack={() => router.push("/dashboard/users")}
        />

        {loading && (
          <div className="flex items-center justify-center py-12">
            <Spinner size={32} />
          </div>
        )}

        {!loading && !canViewAnyUsers && (
          <section className="space-y-2">
            <P className="font-semibold" color={TextColorEnum.Danger}>
              {t(messages.common.noPermission.title)}
            </P>
            <Small color={TextColorEnum.Secondary}>
              {t(messages.common.noPermission.description)}
            </Small>
          </section>
        )}

        {!loading && isError && (
          <section className="space-y-3">
            <P className="font-semibold" color={TextColorEnum.Danger}>
              {t(messages.dashboard.users.detail.notFoundTitle)}
            </P>
            <Small color={TextColorEnum.Secondary}>
              {t(messages.dashboard.users.detail.notFoundDescription)}
            </Small>
            <Button
              type="button"
              size={ButtonSizeEnum.md}
              variant={ButtonVariantEnum.secondary}
              onClick={() => refetch()}
            >
              {t(messages.common.actions.tryAgain)}
            </Button>
          </section>
        )}

        {showContent && viewedUser && (
          <section className="flex flex-col gap-8 lg:flex-row">
            {/* Left column: main info (60%) */}
            <div className="space-y-6 lg:basis-3/5 lg:flex-1">
              <SectionCard
                title={t(messages.dashboard.users.detail.infoTitle)}
                description={viewedUser.email}
                bodyClassName="space-y-4"
              >
                <form onSubmit={handleSubmit} className="space-y-4 relative">
                  <Field
                    id="user-name"
                    label={t(messages.validation.nameLabel)}
                  >
                    <Input
                      id="user-name"
                      type="text"
                      value={name}
                      onChange={(event) => setName(event.target.value)}
                      placeholder={t(messages.validation.namePlaceholder)}
                      disabled={!canEditAnyUsers || saving}
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
                    disabled={
                      !canEditAnyUsers || saving || uploadMedia.isPending
                    }
                  />

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      size={ButtonSizeEnum.md}
                      variant={ButtonVariantEnum.primary}
                      disabled={
                        !canEditAnyUsers ||
                        saving ||
                        (name === viewedUser.name &&
                          avatar?.id === viewedUser.avatar?.id &&
                          !avatarSelection)
                      }
                    >
                      {saving ? (
                        <span className="inline-flex items-center gap-2">
                          <Spinner size={16} />
                          {t(messages.common.actions.saveChanges)}
                        </span>
                      ) : (
                        t(messages.common.actions.saveChanges)
                      )}
                    </Button>
                  </div>
                </form>
              </SectionCard>
            </div>

            {/* Right column: meta + danger zone (40%) */}
            <div className="space-y-6 lg:basis-2/5 lg:flex-1">
              <SectionCard title={t(messages.dashboard.users.detail.metaTitle)}>
                <div className="space-y-1">
                  <Small color={TextColorEnum.Secondary}>
                    ID: {viewedUser.id}
                  </Small>
                  <Small color={TextColorEnum.Secondary}>
                    Role: {roleLabel}
                  </Small>
                  <Small color={TextColorEnum.Secondary}>
                    Plan: {planLabel || "-"}
                  </Small>
                  {typeof viewedUser?.aiCredits === "number" && (
                    <Small color={TextColorEnum.Secondary}>
                      {t(messages.common.aiCreditsLabel)}:{" "}
                      {viewedUser?.aiCredits}
                    </Small>
                  )}
                </div>
              </SectionCard>

              {canAdjustBonus && (
                <SectionCard
                  title={t(messages.dashboard.users.detail.bonusAdjust.title)}
                  description={t(messages.dashboard.users.detail.bonusAdjust.subtitle)}
                  bodyClassName="space-y-3"
                >
                  <form onSubmit={handleAdjustBonus} className="space-y-3">
                    <Field
                      id="user-ai-credits"
                      label={t(messages.dashboard.users.detail.bonusAdjust.inputLabel)}
                    >
                      <Input
                        id="user-ai-credits"
                        type="number"
                        min={0}
                        value={aiCreditsValue}
                        onChange={(event) => setAiCreditsValue(event.target.value)}
                        placeholder={t(
                          messages.dashboard.users.detail.bonusAdjust.inputPlaceholder,
                        )}
                        disabled={adjustUserBonus.isPending}
                      />
                    </Field>

                    {bonusError && (
                      <Small color={TextColorEnum.Danger}>{bonusError}</Small>
                    )}

                    <div className="flex justify-end">
                      <Button
                        type="submit"
                        size={ButtonSizeEnum.md}
                        variant={ButtonVariantEnum.primary}
                        disabled={
                          adjustUserBonus.isPending ||
                          Number.isNaN(Number(aiCreditsValue)) ||
                          Number(aiCreditsValue) < 0 ||
                          Number(aiCreditsValue) === viewedUser?.aiCredits
                        }
                      >
                        {adjustUserBonus.isPending ? (
                          <span className="inline-flex items-center gap-2">
                            <Spinner size={16} />
                            {t(messages.common.actions.saveChanges)}
                          </span>
                        ) : (
                          t(messages.common.actions.saveChanges)
                        )}
                      </Button>
                    </div>
                  </form>
                </SectionCard>
              )}

              {canDeleteAnyUsers && (
                <DangerZoneSection
                  titleKey={messages.dashboard.users.detail.deleteTitle}
                  descriptionKey={
                    messages.dashboard.users.detail.deleteDescription
                  }
                  buttonLabelKey={messages.common.actions.delete}
                  onClick={() => requestUserDelete(viewedUser)}
                  disabled={deletePending}
                />
              )}
            </div>
          </section>
        )}

        {showContent &&
          (canViewSubscriptions || canViewPayments || canViewBonus) && (
            <section className="space-y-4">
              {canViewSubscriptions && (
                <CurrentSubscriptionSection
                  subscription={subscriptionData?.subscription ?? null}
                  loading={subscriptionLoading}
                  canManage={canManageSubscriptions}
                  message={subscriptionData?.message ?? null}
                  onCancel={handleCancelSubscription}
                  onResume={handleResumeSubscription}
                  isCancelling={cancelUserSubscription.isPending}
                  isResuming={resumeUserSubscription.isPending}
                />
              )}

              {canViewPayments && (
                <PaymentsSection
                  payments={userPayments || []}
                  loading={userPaymentsLoading}
                />
              )}

              {canViewBonus && (
                <BonusSection
                  bonusHistory={userBonus || []}
                  loading={userBonusLoading}
                />
              )}
            </section>
          )}
      </Container>

      <DeleteModal
        open={deleteModalProps.open}
        onClose={() => {
          if (deletePending) return;
          deleteModalProps.onClose();
        }}
        requiredValue={deleteModalProps.requiredValue || ""}
        onConfirm={deleteModalProps.onConfirm}
      />
    </PageShell>
  );
}
