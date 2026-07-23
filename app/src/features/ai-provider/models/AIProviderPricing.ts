/**
 * Immutable provider / model pricing placeholders (estimation only).
 *
 * No billing, payments, or network calls.
 */
export interface AIProviderPricing {
  readonly currency: string;
  readonly inputCostPer1KTokens: number | null;
  readonly outputCostPer1KTokens: number | null;
  readonly flatRequestCost: number | null;
  readonly notes: string | null;
}

export const UNKNOWN_PRICING: AIProviderPricing = Object.freeze({
  currency: "USD",
  inputCostPer1KTokens: null,
  outputCostPer1KTokens: null,
  flatRequestCost: null,
  notes: null,
});
