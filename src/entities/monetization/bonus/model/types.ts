export enum BonusSourceType {
  SUBSCRIPTION = "subscription",
  ONE_TIME = "one_time",
  REFERRAL_SIGNUP = "referral_signup",
  REFERRAL_PURCHASE = "referral_purchase",
  MANUAL_ADJUST = "manual_adjust",
}

export interface BonusHistoryItem {
  id: string;
  userId: string;
  sourceType: BonusSourceType | string;
  sourceId?: string | null;
  targetModel?: string | null;
  targetId?: string | null;
  fieldsDelta: Record<string, number>;
  createdAt: string;
}

export type BonusHistoryResponse = {
  success: boolean;
  message?: string | null;
  data: BonusHistoryItem[];
};

export interface BonusAdjustRequest {
  aiCredits?: number;
}

export interface SuccessEnvelopeData<T = unknown> {
  success: boolean;
  message?: string | null;
  data: T;
}