"use client";

export type ToastVariant = "success" | "error" | "warning" | "info";

export type ToastItem = {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
};

type Listener = () => void;

type ToastOptions = {
  duration?: number;
};

type ToastPayload = {
  title: string;
  description?: string;
  variant: ToastVariant;
  options?: ToastOptions;
};

let toasts: ToastItem[] = [];
const listeners = new Set<Listener>();
const timeouts = new Map<string, number>();

const notify = () => {
  listeners.forEach((listener) => listener());
};

const removeToast = (id: string) => {
  const timeout = timeouts.get(id);
  if (timeout) {
    window.clearTimeout(timeout);
    timeouts.delete(id);
  }
  toasts = toasts.filter((toast) => toast.id !== id);
  notify();
};

const addToast = ({ title, description, variant, options }: ToastPayload) => {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
  toasts = [...toasts, { id, title, description, variant }];
  notify();
  const duration = options?.duration ?? 4000;
  const timeout = window.setTimeout(() => removeToast(id), duration);
  timeouts.set(id, timeout);
};

export const toast = {
  success: (title: string, description?: string, options?: ToastOptions) =>
    addToast({ title, description, variant: "success", options }),
  error: (title: string, description?: string, options?: ToastOptions) =>
    addToast({ title, description, variant: "error", options }),
  warning: (title: string, description?: string, options?: ToastOptions) =>
    addToast({ title, description, variant: "warning", options }),
  info: (title: string, description?: string, options?: ToastOptions) =>
    addToast({ title, description, variant: "info", options }),
};

export const toastStore = {
  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => toasts,
  remove: removeToast,
};
