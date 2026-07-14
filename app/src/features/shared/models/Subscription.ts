export type SubscriptionTier = "free" | "plus" | "pro";

export type SubscriptionStatus =
  | "active"
  | "trialing"
  | "canceled"
  | "expired"
  | "past_due";

/** Billing and entitlement state for premium capabilities. */
export interface Subscription {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  currentPeriodStart: string | null;
  currentPeriodEnd: string | null;
  trialEndsAt: string | null;
  autoRenew: boolean;
  memberSince: string | null;
}
