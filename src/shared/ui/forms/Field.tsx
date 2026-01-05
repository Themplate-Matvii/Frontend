import { ReactNode } from "react";

type FieldProps = {
  /** Form control id to bind label htmlFor */
  id?: string;
  /** Label text or node */
  label?: ReactNode;
  /** Optional content under the field (errors, helpers) */
  footer?: ReactNode;
  /** Field content (input element) */
  children: ReactNode;
};

export default function Field({ id, label, footer, children }: FieldProps) {
  return (
    <div className="space-y-1">
      {label ? (
        <label
          htmlFor={id}
          id={id ? `${id}-label` : undefined}
          className="block text-xs font-medium uppercase tracking-wide text-secondary"
        >
          {label}
        </label>
      ) : null}
      {children}
      {footer}
    </div>
  );
}
