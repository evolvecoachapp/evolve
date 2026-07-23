import type { OpenAIRetryPolicy } from "../models/OpenAIRetryPolicy";
import { DEFAULT_OPENAI_RETRY_POLICY } from "../models/OpenAIRetryPolicy";
import { computeBackoffDelayMs } from "./backoff";

export interface RetryAttempt {
  readonly attempt: number;
  readonly maxRetries: number;
  readonly delayMs: number;
  readonly exhausted: boolean;
}

/**
 * Compute next retry attempt metadata from an immutable retry policy.
 */
export function nextRetryAttempt(
  attempt: number,
  policy: OpenAIRetryPolicy = DEFAULT_OPENAI_RETRY_POLICY,
): RetryAttempt {
  const normalizedAttempt = Math.max(0, Math.floor(attempt));
  const exhausted = normalizedAttempt >= policy.maxRetries;
  return Object.freeze({
    attempt: normalizedAttempt,
    maxRetries: policy.maxRetries,
    delayMs: exhausted
      ? 0
      : computeBackoffDelayMs(normalizedAttempt, policy),
    exhausted,
  });
}

export function shouldRetry(
  attempt: number,
  retryable: boolean,
  policy: OpenAIRetryPolicy = DEFAULT_OPENAI_RETRY_POLICY,
): boolean {
  if (!retryable) {
    return false;
  }
  return attempt < policy.maxRetries;
}
