import type { OpenAIRetryPolicy } from "../models/OpenAIRetryPolicy";
import { DEFAULT_OPENAI_RETRY_POLICY } from "../models/OpenAIRetryPolicy";

/**
 * Exponential backoff delay (with optional jitter).
 */
export function computeBackoffDelayMs(
  attempt: number,
  policy: OpenAIRetryPolicy = DEFAULT_OPENAI_RETRY_POLICY,
  random: () => number = Math.random,
): number {
  const safeAttempt = Math.max(0, Math.floor(attempt));
  const raw =
    policy.initialDelayMs * Math.pow(policy.multiplier, safeAttempt);
  const capped = Math.min(raw, policy.maxDelayMs);
  if (!policy.jitter) {
    return Math.floor(capped);
  }
  const jitterFactor = 0.5 + random() * 0.5;
  return Math.floor(capped * jitterFactor);
}
