import { HttpError } from "../models/HttpError";

/** Optional per-request / constructor retry configuration. */
export interface RetryPolicyOptions {
  readonly maxRetries: number;
  readonly retryableStatuses?: readonly number[];
  readonly baseDelayMs?: number;
}

const DEFAULT_RETRYABLE_STATUSES: readonly number[] = Object.freeze([
  408, 429, 500, 502, 503, 504,
]);

/**
 * Decides whether an HttpError should be retried and how long to wait.
 *
 * No provider-specific logic.
 */
export class RetryPolicy {
  readonly maxRetries: number;
  readonly retryableStatuses: readonly number[];
  readonly baseDelayMs: number;

  constructor(options: RetryPolicyOptions) {
    if (!Number.isInteger(options.maxRetries) || options.maxRetries < 0) {
      throw new Error(
        `RetryPolicy requires non-negative maxRetries, got: ${options.maxRetries}`,
      );
    }

    this.maxRetries = options.maxRetries;
    this.retryableStatuses = Object.freeze(
      options.retryableStatuses ?? DEFAULT_RETRYABLE_STATUSES,
    );
    this.baseDelayMs = options.baseDelayMs ?? 200;
  }

  /** True when another attempt is allowed for this failure. */
  shouldRetry(attempt: number, error: HttpError): boolean {
    if (attempt >= this.maxRetries) {
      return false;
    }

    if (!error.retryable) {
      return false;
    }

    if (error.code === "timeout" || error.code === "network") {
      return true;
    }

    if (error.code === "http" && error.status !== undefined) {
      return this.retryableStatuses.includes(error.status);
    }

    return false;
  }

  /** Exponential backoff delay for the given zero-based attempt index. */
  delayMs(attempt: number): number {
    return this.baseDelayMs * 2 ** attempt;
  }
}
