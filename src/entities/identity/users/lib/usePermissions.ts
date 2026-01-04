"use client";

import { useMemo } from "react";
import { useAuth } from "@/entities/identity";
import type { Permissions } from "@/shared/types/api/permissions";

export function useAppPermissions(): Permissions {
  const { user } = useAuth();
  const raw = user?.permissions as Permissions | undefined;

  return useMemo<Permissions>(() => {
    return {
      users: {
        any: {
          view: !!raw?.users?.any?.view,
          edit: !!raw?.users?.any?.edit,
          delete: !!raw?.users?.any?.delete,
        },
        own: {
          view: !!raw?.users?.own?.view,
          edit: !!raw?.users?.own?.edit,
          delete: !!raw?.users?.own?.delete,
        },
      },
      media: {
        any: {
          create: !!raw?.media?.any?.create,
          update: !!raw?.media?.any?.update,
          view: !!raw?.media?.any?.view,
          delete: !!raw?.media?.any?.delete,
        },
        own: {
          create: !!raw?.media?.own?.create,
          update: !!raw?.media?.own?.update,
          view: !!raw?.media?.own?.view,
          delete: !!raw?.media?.own?.delete,
        },
      },
      landings: {
        create: !!raw?.landings?.create,
        any: {
          view: !!raw?.landings?.any?.view,
          edit: !!raw?.landings?.any?.edit,
          delete: !!raw?.landings?.any?.delete,
        },
        own: {
          view: !!raw?.landings?.own?.view,
          edit: !!raw?.landings?.own?.edit,
          delete: !!raw?.landings?.own?.delete,
        },
      },
      analitycs_traffic: {
        view: !!raw?.analitycs_traffic?.view,
      },
      analitycs_business: {
        view: !!raw?.analitycs_business?.view,
      },
      payments: {
        any: {
          view: !!raw?.payments?.any?.view,
        },
        own: {
          view: !!raw?.payments?.own?.view,
        },
      },
      subscriptions: {
        any: {
          view: !!raw?.subscriptions?.any?.view,
          manage: !!raw?.subscriptions?.any?.manage,
        },
        own: {
          view: !!raw?.subscriptions?.own?.view,
          manage: !!raw?.subscriptions?.own?.manage,
        },
      },
      feedback: {
        view: !!raw?.feedback?.view,
      },
      bonus: {
        history: {
          any: {
            view: !!raw?.bonus?.history?.any?.view,
          },
          own: {
            view: !!raw?.bonus?.history?.own?.view,
          },
        },
        adjust: !!raw?.bonus?.adjust,
      },
      email: {
        one: !!raw?.email?.one,
        broadcast: !!raw?.email?.broadcast,
      },
    };
  }, [raw]);
}
