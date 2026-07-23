import type { AITokenUsage } from "../models/AITokenUsage";
import type { AIUsage } from "../models/AIUsage";
import { ZERO_USAGE } from "../models/AIUsage";

/**
 * Normalize token usage into a full AIUsage snapshot.
 */
export function normalizeUsage(
  usage: Partial<AITokenUsage> | Partial<AIUsage> | null | undefined,
  options: {
    readonly estimatedCost?: number | null;
    readonly currency?: string | null;
  } = {},
): AIUsage {
  if (!usage) {
    return ZERO_USAGE;
  }

  const promptTokens = Math.max(0, Math.floor(usage.promptTokens ?? 0));
  const completionTokens = Math.max(
    0,
    Math.floor(usage.completionTokens ?? 0),
  );
  const totalTokens = Math.max(
    promptTokens + completionTokens,
    Math.floor(usage.totalTokens ?? 0),
  );

  const estimatedCost =
    options.estimatedCost !== undefined
      ? options.estimatedCost
      : "estimatedCost" in usage
        ? (usage.estimatedCost ?? null)
        : null;

  const currency =
    options.currency !== undefined
      ? options.currency
      : "currency" in usage
        ? (usage.currency ?? null)
        : null;

  return Object.freeze({
    promptTokens,
    completionTokens,
    totalTokens,
    estimatedCost,
    currency,
  });
}
