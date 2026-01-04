"use client";

// Comments in English only

import { useState } from "react";
import { ZodError, z } from "zod";
import { useRouter } from "next/navigation";
import { Small, TextColorEnum } from "@/shared/ui/Typography";
import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import { ENV } from "@/shared/config";
import { useGoogleOAuth } from "@/features/auth/lib/useGoogleOAuth";
import { useTheme } from "@/shared/lib/theme";
import { OAuthIntent, UserApi } from "@/entities/user";
import { toast } from "@/shared/ui/toast";

/** Parse "i18n.key|{json}" into { key, params } */
function parseI18n(raw: unknown): { key: string | null; params: any } {
  if (typeof raw !== "string") return { key: null, params: {} };
  const s = raw.trim();
  if (/^\d+\}?$/.test(s) || /^\{.*\}$/.test(s)) return { key: null, params: {} };
  const [k, rest] = s.split("|", 2);
  if (!k) return { key: null, params: {} };
  if (!rest) return { key: k, params: {} };
  try {
    return { key: k, params: JSON.parse(rest) };
  } catch {
    return { key: k, params: {} };
  }
}

/** Force i18n result to string */
function tText<T extends object = any>(tfn: any, key: string, params?: T): string {
  const v = tfn(key as any, params);
  return typeof v === "string" ? v : String(v ?? "");
}

/** Public shape for per-field errors used by SignIn/SignUp pages */
export type FieldErrors = Record<string, string[]>;

/** Convert ZodError to FieldErrors */
export function zodToFieldErrors(err: ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of err.issues) {
    const name = issue.path?.[0] as string;
    if (!name) continue;
    if (!out[name]) out[name] = [];
    out[name].push(String(issue.message));
  }
  return out;
}

/** Render translated list of field errors */
export function FieldErrorsList({ errors }: { errors?: string[] }) {
  const { t } = useI18n();
  if (!errors?.length) return null;
  return (
    <>
      {errors
        .map((raw) => parseI18n(raw))
        .filter((x) => x.key)
        .map(({ key, params }, i) => (
          <Small color={TextColorEnum.Danger} key={i} className="mt-1 block">
            {tText(t, key as string, params)}
          </Small>
        ))}
    </>
  );
}

/** Options for the generic auth form hook */
type UseAuthFormOptions<TValues extends Record<string, any>> = {
  initial: TValues;
  schema: z.ZodSchema<TValues>;
  pick: Partial<Record<keyof TValues, z.ZodSchema<any>>>;
  submit: (values: TValues) => Promise<void>;
  successToastKey?: string;
  /**
   * Redirect behavior after successful submit:
   * - undefined: redirect to "/dashboard" (default, keeps old behavior)
   * - string: redirect to this path
   * - null: no redirect
   */
  redirectTo?: string | null;
  googleEnabled?: boolean;
  /** OAuth intent passed to backend: "login" or "register" */
  oauthIntent?: OAuthIntent;
};

/**
 * Generic auth form state manager used by SignIn, SignUp, ForgotPassword.
 */
export function useAuthForm<TValues extends Record<string, any>>(
  opts: UseAuthFormOptions<TValues>,
) {
  const router = useRouter();
  const { t } = useI18n();
  const { mutateAsync: oauthLogin, isPending: isOauthPending } =
    UserApi.Auth.useOauthLogin("google");
  const { theme } = useTheme();

  const [values, setValues] = useState<TValues>(opts.initial);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [globalMsg, setGlobalMsg] = useState<string | null>(null);

  const shouldRedirect = opts.redirectTo !== null; // null disables redirect
  const redirectTarget = opts.redirectTo ?? "/dashboard";

  // Per-field validate
  const validateField = (name: keyof TValues, value: any) => {
    const schema = opts.pick[name];
    if (!schema) return;
    const parsed = schema.safeParse({ [name]: value });
    setFieldErrors((prev) => {
      const next = { ...prev };
      delete next[name as string];
      if (!parsed.success) {
        const errs = zodToFieldErrors(parsed.error as ZodError);
        if (errs[name as string]?.length) next[name as string] = errs[name as string];
      }
      return next;
    });
  };

  const handleChange =
    (name: keyof TValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const v = e.target.value;
      setValues((s) => ({ ...s, [name]: v }));
      setGlobalMsg(null);
      validateField(name, v);
    };

  const submitValues = async (payload: TValues) => {
    setValues(payload);
    const parsed = opts.schema.safeParse(payload);
    if (!parsed.success) {
      setFieldErrors(zodToFieldErrors(parsed.error as ZodError));
      setGlobalMsg(null);
      return;
    }
    setFieldErrors({});
    setGlobalMsg(null);
    try {
      await opts.submit(payload);
      if (opts.successToastKey) {
        toast.success(t(opts.successToastKey));
      }
      if (shouldRedirect) router.replace(redirectTarget);
    } catch (err: any) {

      const data = err?.response?.data;
      const perField: FieldErrors = data?.errors || {};
      if (Object.keys(perField).length) setFieldErrors(perField);
      const message =
        (data?.message as string) || t(messages.errors.generic);
      setGlobalMsg(message);
      toast.error(message);
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitValues(values);
  };

  // Google OAuth (PKCE)
  const google =
  opts.googleEnabled && ENV.GOOGLE_CLIENT_ID
    ? useGoogleOAuth({
        clientId: ENV.GOOGLE_CLIENT_ID || "",
        scope: "openid email profile",
        uxMode: "popup",
        onCode: async (code, locale) => {
          // clear previous errors
          setFieldErrors({});
          setGlobalMsg(null);

          try {
            await oauthLogin({
              code,
              redirect_uri: "postmessage",
              locale,
              theme,
              intent: opts.oauthIntent ?? OAuthIntent.login,
            });
            if (opts.successToastKey) {
              toast.success(t(opts.successToastKey));
            }
            if (shouldRedirect) router.replace(redirectTarget);
          } catch (err: any) {
            const data = err?.response?.data;
            const perField: FieldErrors = data?.errors || {};
            if (Object.keys(perField).length) setFieldErrors(perField);
            const message =
              (data?.message as string) ||
              t(messages.errors.generic);
            setGlobalMsg(message);
            toast.error(message);
          }
        }
      })
    : null;

  const isBusy = Boolean(isOauthPending || (google && google.isRunning));

  return {
    values,
    setValues,
    fieldErrors,
    setFieldErrors,
    globalMsg,
    setGlobalMsg,
    handleChange,
    onSubmit,
    google,
    isBusy,
    submitValues,
  };
}
