import { z } from "zod";
import { messages } from "@/i18n";
import { Theme } from "@/shared/ui";

/**
 * Email
 */
export const email = z
  .string()
  .trim()
  .toLowerCase()
  .email(messages.validation.invalidEmail)
  .max(254, `${messages.validation.maxLength}|{"max":254}`);

/**
 * Strong password
 */
export const strongPassword = z
  .string()
  .trim()
  .min(8, `${messages.validation.minLength}|{"min":8}`)
  .max(128, `${messages.validation.maxLength}|{"max":128}`)
  .regex(/[a-z]/, messages.validation.passwordLowercase)
  .regex(/[A-Z]/, messages.validation.passwordUppercase)
  .regex(/[0-9]/, messages.validation.passwordDigit)
  .regex(
    /[!@#$%^&*(),.?":{}|<>_\-+=\\[\]\\/~`';]/,
    messages.validation.passwordSymbol,
  );

/**
 * Login schema
 */
export const loginSchema = z.object({
  email,
  password: z.string().min(1, messages.validation.required).trim(),
});
export type LoginDTO = z.infer<typeof loginSchema>;

/**
 * Register schema
 */
export const registerSchema = z.object({
  email,
  password: strongPassword,
  name: z
    .string()
    .trim()
    .min(2, `${messages.validation.nameTooShort}|{"min":2}`)
    .max(64, `${messages.validation.nameTooLong}|{"max":64}`)
    .optional(),
  locale: z.string().optional(),
  theme: z.nativeEnum(Theme).optional(),
  avatar: z.string().trim().optional(),
  avatarUrl: z.string().trim().url(messages.validation.invalidOption).optional(),
  avatarFile: z.any().optional(),
});
export type RegisterDTO = z.infer<typeof registerSchema>;

/**
 * Forgot password schema
 */
export const forgotPasswordSchema = z.object({
  email,
});
export type ForgotPasswordDTO = z.infer<typeof forgotPasswordSchema>;