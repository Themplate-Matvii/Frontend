// Convert server error payload { errors: [{ path, message }, ...] } to field map
export type FieldErrors = Record<string, string[]>;

export function serverToFieldErrors(payload: any): FieldErrors {
  const out: FieldErrors = {};
  const arr = payload?.errors;
  if (!Array.isArray(arr)) return out;
  for (const it of arr) {
    const k = String(it?.path ?? "_");
    (out[k] ||= []).push(String(it?.message ?? "Error"));
  }
  return out;
}

// Convert ZodError to field map. Accepts unknown to keep call sites simple.
export function zodToFieldErrors(e: unknown): FieldErrors {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const z: any = e as any;
  if (!z?.issues) return {};
  const out: FieldErrors = {};
  for (const issue of z.issues as Array<{
    path: (string | number)[];
    message: string;
  }>) {
    const k = issue.path.join(".") || "_";
    (out[k] ||= []).push(String(issue.message));
  }
  return out;
}
