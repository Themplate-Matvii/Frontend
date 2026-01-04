import { z } from "zod";

/** Minimal generic API envelope validator used in this module. */
export const ApiEnvelope = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    message: z.string().nullable().optional(),
    data: dataSchema,
  });

/** Matches backend Subscription schema. */
export const SubscriptionSchema = z.object({
  id: z.string(),
  userId: z.string(),
  planKey: z.string(),
  provider: z.string(),
  providerSubscriptionId: z.string(),
  status: z.string(),
  trialEnd: z.string().nullable().optional(),
  currentPeriodStart: z.string().nullable().optional(),
  currentPeriodEnd: z.string().nullable().optional(),
  cancelAt: z.string().nullable().optional(),
  canceledAt: z.string().nullable().optional(),
  lastPaymentAt: z.string().nullable().optional(),
  metadata: z.record(z.unknown()).optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const GetMySubscriptionResponseSchema = ApiEnvelope(SubscriptionSchema);
export const CancelSubscriptionResponseSchema = ApiEnvelope(SubscriptionSchema);

export type SubscriptionDTO = z.infer<typeof SubscriptionSchema>;
