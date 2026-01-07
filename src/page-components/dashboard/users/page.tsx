"use client";

import React, { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  useAuth,
  UserApi,
  useAppPermissions,
  usePermissionGuard,
  type User,
} from "@/entities/identity";
import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import {
  BillingMode,
  PricingApi,
  type PricingProduct,
} from "@/entities/monetization/pricing";

import { Container } from "@/shared/layout/Container";
import { PageHeader } from "@/shared/layout/PageHeader";
import { PageShell } from "@/shared/layout/PageShell";

import Field from "@/shared/ui/forms/Field";
import { ItemCard } from "@/shared/ui/list/ItemCard";
import { UserPreview } from "@/entities/identity";
import { DeleteModal } from "@/shared/ui/modal/DeleteModal";

import { usePageSize } from "@/shared/lib/hooks/usePageSize";
import { useDeleteWithConfirm } from "@/shared/lib/hooks/useDeleteWithConfirm";
import { ListSection } from "@/shared/ui/list/ListSection";
import { Select } from "@/shared/ui/forms/Select";
import { sortEnum } from "@/shared/types/api/pagination";
import { toast } from "@/shared/ui/toast/toast";

export const DashboardUsersPage = () => {
  const { t } = useI18n();
  const router = useRouter();
  const { loading: authLoading } = useAuth();
  const { users: usersPermissions } = useAppPermissions();

  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>("");
  const [sort, setSort] = useState<sortEnum>(sortEnum.desc);
  const [planKey, setPlanKey] = useState<string>("");

  const { pageSize, setPageSize } = usePageSize({
    defaultSize: 5,
  });

  const canViewAnyUsers = usersPermissions.any.view;
  const canEditAnyUsers = usersPermissions.any.edit;
  const canDeleteAnyUsers = usersPermissions.any.delete;

  const { canAccess } = usePermissionGuard({
    canAccess: canViewAnyUsers,
  });

  const queryParams = useMemo(
    () => ({
      page,
      limit: pageSize,
      s: search || undefined,
      plan: planKey || undefined,
      sort: sort || undefined,
    }),
    [page, pageSize, search, planKey, sort],
  );

  const {
    data: usersPage,
    isLoading,
    isError,
    refetch,
  } = UserApi.User.useUsers(queryParams);

  const { data: pricingData, isLoading: pricingLoading } =
    PricingApi.usePricing({
      mode: BillingMode.subscription,
      enabled: canViewAnyUsers,
      select: (data: PricingProduct[]) => data,
    });

  const planOptions = useMemo<PricingProduct[]>(() => {
    if (Array.isArray(pricingData)) return pricingData;
    return [];
  }, [pricingData]);

  const planSelectOptions = useMemo(
    () => [
      {
        value: "",
        label: t(messages.dashboard.users.filters.allPlans),
      },
      ...planOptions.map((plan) => ({
        value: plan.key,
        label: plan.name ?? plan.nameKey ?? plan.key,
      })),
    ],
    [planOptions, t],
  );

  const deleteUserMutation = UserApi.User.useDeleteUser();

  const { requestDelete, modalProps: deleteModalProps } =
    useDeleteWithConfirm<User>({
      canDelete: canDeleteAnyUsers,
      getLabel: (u) =>
        u.name && u.name.trim().length > 0 ? u.name.trim() : u.email,
      onDelete: async (u) => {
        try {
          await deleteUserMutation.mutateAsync(u.id);
          toast.success(t(messages.notifications.users.deleteSuccess));
          await refetch();
        } catch (error: any) {
          const message =
            error?.response?.data?.message || t(messages.errors.generic);
          toast.error(message);
        }
      },
    });

  const handleResetFilters = () => {
    setSearch("");
    setPlanKey("");
    setPage(1);
  };

  const handlePageSizeChange = (value: number) => {
    setPageSize(value);
    setPage(1);
  };

  if (!canAccess && !authLoading) {
    return null;
  }

  return (
    <PageShell>
      <Container>
        <PageHeader
          title={t(messages.dashboard.users.list.title)}
          subtitle={t(messages.dashboard.users.list.subtitle)}
        />

        <ListSection<User>
          canView={canViewAnyUsers}
          authLoading={authLoading}
          isError={isError}
          isLoading={isLoading}
          onRetry={refetch}
          data={usersPage}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={handlePageSizeChange}
          filters={{
            searchValue: search,
            onSearchChange: (value) => {
              setSearch(value);
              setPage(1);
            },
            sortValue: sort,
            onSortChange: setSort,
            onClearAll: handleResetFilters,
            extraFilters: (
              <Field
                id="users-plan"
                label={t(messages.dashboard.users.filters.planLabel)}
              >
                <Select
                  id="users-plan"
                  value={planKey}
                  options={planSelectOptions}
                  onChange={(value) => {
                    setPlanKey(value as string);
                    setPage(1);
                  }}
                  isDisabled={pricingLoading}
                />
              </Field>
            ),
          }}
          emptyTitleKey={messages.dashboard.users.list.emptyTitle}
          emptyDescriptionKey={messages.dashboard.users.list.emptyDescription}
          renderItem={(user) => (
            <ItemCard
              canEdit={canEditAnyUsers}
              canDelete={canDeleteAnyUsers}
              onEdit={() => router.push(`/dashboard/users/${user.id}`)}
              onDelete={() => requestDelete(user)}
              actionsSide="right"
            >
              <UserPreview user={user} showEmail showPlan showRoleBadge />
            </ItemCard>
          )}
          getItemKey={(user) => user.id}
        />
      </Container>

      <DeleteModal
        open={deleteModalProps.open}
        onClose={deleteModalProps.onClose}
        requiredValue={deleteModalProps.requiredValue || ""}
        onConfirm={deleteModalProps.onConfirm}
      />
    </PageShell>
  );
};
