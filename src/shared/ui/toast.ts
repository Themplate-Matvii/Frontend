"use client";

type ToastVariant = "success" | "error" | "info";

export type ToastItem = {
  id: string;
  message: string;
  variant: ToastVariant;
};

type Listener = () => void;

let toasts: ToastItem[] = [];
const listeners = new Set<Listener>();

const notify = () => {
  listeners.forEach((listener) => listener());
};

const removeToast = (id: string) => {
  toasts = toasts.filter((toast) => toast.id !== id);
  notify();
};

const addToast = (message: string, variant: ToastVariant) => {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random()}`;
  toasts = [...toasts, { id, message, variant }];
  notify();
  window.setTimeout(() => removeToast(id), 4000);
};

export const toast = {
  success: (message: string) => addToast(message, "success"),
  error: (message: string) => addToast(message, "error"),
  info: (message: string) => addToast(message, "info"),
};

export const toastStore = {
  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => toasts,
  remove: removeToast,
};
