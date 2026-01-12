export const normalizeNullable = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : "";
};

export const normalizeDateValue = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
};
