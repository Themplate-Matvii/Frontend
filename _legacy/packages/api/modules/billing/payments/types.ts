import { ApiResponse } from '@packages/api/types/global';
import { BonusSourceType } from '../../bonus/types';

export enum PaymentStatus {
  PENDING = "pending",
  SUCCEEDED = "succeeded",
  FAILED = "failed",
  CANCELED = "canceled",
}

/**
 * Payment as returned by the backend.
 * GET /api/payments/my -> Payment[]
 */
export interface Payment {
  id: string;
  userId: string;
  planKey?: string | null;
  productKey?: string | null;
  provider: string;
  providerPaymentId: string;
  amount: number;
  currency: string;
  status: PaymentStatus | string;
  sourceType?: BonusSourceType;
  createdAt: string;
  updatedAt: string;
  invoiceId?: string,
  invoiceUrl?: string,
  invoicePdfUrl?: string,
  receiptUrl?: string,
  checkoutSessionId?: string,
}

/** GET /api/payments/my -> Payment[] */
export type PaymentsListResponse = ApiResponse<Payment[]>;

/**
 * POST /api/payments/checkout
 * Accepts planKey and returns a redirect URL to provider checkout.
 */
export type CheckoutRequest = {planKey: string};

export type OneTimeCheckoutRequest = {productKey: string};

export type CheckoutResponse = ApiResponse<{url: string}>;
