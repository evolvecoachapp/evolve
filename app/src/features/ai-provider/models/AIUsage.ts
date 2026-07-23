import type { AITokenUsage } from "./AITokenUsage";

/**
 * Immutable usage accounting (tokens + optional cost estimate).
 *
 * Extends token usage with optional estimated cost for pricing helpers.
 */
export interface AIUsage extends AITokenUsage {
  readonly estimatedCost: number | null;
  readonly currency: string | null;
}

export const ZERO_USAGE: AIUsage = Object.freeze({
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0,
  estimatedCost: null,
  currency: null,
});
