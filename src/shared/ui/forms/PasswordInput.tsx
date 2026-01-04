"use client";

import * as React from "react";
import Input from "./Input";
import { Eye, EyeOff, Wand2 } from "lucide-react";
import { messages } from "@/i18n/messages";
import { useI18n } from "@/shared/lib/i18n";
import Tooltip, { TooltipPosition } from "@/shared/ui/Tooltip";

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  invalid?: boolean;
  showToggle?: boolean;
  showStrength?: boolean;
  showGenerateStrength?: boolean;
  onStrengthChange?: (score: Strength["score"]) => void;
  strengthCalculator?: (value: string) => Strength;
};

type ValidationKey = keyof typeof messages.validation;
type ValidationMsg = (typeof messages.validation)[ValidationKey];

type Strength =
  | { score: 0 | 1; label: ValidationMsg; className: string }
  | { score: 2; label: ValidationMsg; className: string }
  | { score: 3; label: ValidationMsg; className: string };

/** Three-level strength: weak (danger), fair (warning), strong (success). */
function defaultStrengthCalculator(value: string): Strength {
  const v = value ?? "";
  const hasLower = /[a-z]/.test(v);
  const hasUpper = /[A-Z]/.test(v);
  const hasDigit = /[0-9]/.test(v);
  const hasSymbol = /[!@#$%^&*(),.?":{}|<>_\-+=\\[\]\\/~`';]/.test(v);
  const min8 = v.length >= 8;

  const passed = [min8, hasLower, hasUpper, hasDigit, hasSymbol].filter(
    Boolean,
  ).length;

  let score: 0 | 1 | 2 | 3 = 0;
  if (passed <= 2) score = 1;
  else if (passed === 3 || passed === 4) score = 2;
  else if (passed === 5) score = 3;

  if (score <= 1)
    return {
      score,
      label: messages.validation.passwordWeak,
      className: "text-danger",
    };
  if (score === 2)
    return {
      score,
      label: messages.validation.passwordFair,
      className: "text-warning",
    };
  return {
    score,
    label: messages.validation.passwordStrong,
    className: "text-success",
  };
}

/** CSPRNG int in [0, max). Falls back to Math.random if crypto is unavailable. */
function rnd(max: number) {
  if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
    const a = new Uint32Array(1);
    window.crypto.getRandomValues(a);
    return a[0] % max;
  }
  return Math.floor(Math.random() * max);
}

/** Fisher–Yates shuffle. */
function shuffle(s: string) {
  const arr = s.split("");
  for (let i = arr.length - 1; i > 0; i--) {
    const j = rnd(i + 1);
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr.join("");
}

/** Generates a strong password satisfying all validation rules. */
function generateStrongPassword(len = 14) {
  const LOWER = "abcdefghijkmnopqrstuvwxyz"; // no l
  const UPPER = "ABCDEFGHJKMNPQRSTUVWXYZ"; // no I O
  const DIGIT = "23456789"; // no 0 1
  const SYMBOL = "!@#$%^&*()_+-={}[]<>?";

  let pwd = "";
  pwd += LOWER[rnd(LOWER.length)];
  pwd += UPPER[rnd(UPPER.length)];
  pwd += DIGIT[rnd(DIGIT.length)];
  pwd += SYMBOL[rnd(SYMBOL.length)];

  const ALL = LOWER + UPPER + DIGIT + SYMBOL;
  while (pwd.length < len) pwd += ALL[rnd(ALL.length)];

  return shuffle(pwd);
}

/** Password input with reveal toggle, 3-color strength bar, and generator tooltip. */
export default function PasswordInput({
  invalid,
  showToggle = true,
  showStrength = false,
  showGenerateStrength = false,
  onStrengthChange,
  strengthCalculator = defaultStrengthCalculator,
  className,
  onChange,
  value,
  ...rest
}: Props) {
  const { t } = useI18n();
  const [revealed, setRevealed] = React.useState(false);
  const [inner, setInner] = React.useState("");
  const isControlled = value != null;
  const currentValue = String(isControlled ? value : inner);

  const setValue = (next: string) => {
    if (!isControlled) setInner(next);
    onChange?.({ target: { value: next } } as any);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isControlled) setInner(e.target.value);
    onChange?.(e);
  };

  const strength = React.useMemo(
    () => (showStrength ? strengthCalculator(currentValue) : null),
    [showStrength, currentValue, strengthCalculator],
  );

  React.useEffect(() => {
    if (onStrengthChange) onStrengthChange(strength ? strength.score : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strength?.score, showStrength]);

  return (
    <div className="space-y-1">
      {/* Reserve extra right padding for two buttons */}
      <div className="relative">
        <Input
          {...rest}
          value={value}
          onChange={handleChange}
          type={revealed ? "text" : "password"}
          autoComplete={rest.autoComplete ?? "current-password"}
          invalid={invalid}
          className={["pr-24", className].filter(Boolean).join(" ")}
        />

        {/* Right controls: generator (with tooltip) + eye toggle */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1 pr-2">
          {showGenerateStrength && (
            <Tooltip
              content={t(messages.tooltips.generatePassword)}
              placement={TooltipPosition.top}
            >
              <button
                type="button"
                onClick={() => {
                  const pwd = generateStrongPassword();
                  setValue(pwd);
                  setRevealed(true);
                }}
                className="px-2 py-1 rounded text-xs border border-border hover:bg-muted"
              >
                <Wand2 size={14} />
              </button>
            </Tooltip>
          )}

          {showToggle && (
            <button
              type="button"
              onClick={() => setRevealed((v) => !v)}
              className="px-2 py-1 rounded text-muted hover:text-text"
              aria-label={revealed ? "Hide password" : "Show password"}
              title={revealed ? "Hide" : "Show"}
              tabIndex={-1}
            >
              {revealed ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
      </div>

      {showStrength && (
        <div className="mt-1">
          <div
            className={[
              "h-1 rounded transition-all duration-300",
              strength?.score === 0
                ? "bg-border"
                : strength?.score === 1
                  ? "bg-danger"
                  : strength?.score === 2
                    ? "bg-warning"
                    : "bg-success",
            ].join(" ")}
            style={{ width: `${(strength?.score ?? 0) * 33}%` }}
          />
          {strength && (
            <div className={["mt-1 text-xs", strength.className].join(" ")}>
              {t(strength.label as any)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
