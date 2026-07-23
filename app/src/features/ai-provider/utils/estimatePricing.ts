import type { AIProviderPricing } from "../models/AIProviderPricing";
import type { AITokenUsage } from "../models/AITokenUsage";

/**
 * Estimate cost from token usage + pricing metadata.
 * Returns null when pricing is unknown.
 */
export function estimatePricing(
  usage: AITokenUsage,
  pricing: AIProviderPricing | null | undefined,
): number | null {
  if (!pricing) {
    return null;
  }

  let total = 0;
  let hasComponent = false;

  if (pricing.flatRequestCost != null) {
    total += pricing.flatRequestCost;
    hasComponent = true;
  }

  if (pricing.inputCostPer1KTokens != null) {
    total += (usage.promptTokens / 1000) * pricing.inputCostPer1KTokens;
    hasComponent = true;
  }

  if (pricing.outputCostPer1KTokens != null) {
    total += (usage.completionTokens / 1000) * pricing.outputCostPer1KTokens;
    hasComponent = true;
  }

  return hasComponent ? total : null;
}
