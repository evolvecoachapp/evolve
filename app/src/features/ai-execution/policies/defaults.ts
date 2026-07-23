import type { CancellationPolicy } from "./CancellationPolicy";
import type { ExecutionPolicy } from "./ExecutionPolicy";
import type { RetryPolicy } from "./RetryPolicy";
import type { TimeoutPolicy } from "./TimeoutPolicy";

export const DEFAULT_RETRY_POLICY: RetryPolicy = Object.freeze({
  enabled: false,
  maxAttempts: null,
  backoffMs: null,
});

export const DEFAULT_TIMEOUT_POLICY: TimeoutPolicy = Object.freeze({
  enabled: false,
  timeoutMs: null,
});

export const DEFAULT_CANCELLATION_POLICY: CancellationPolicy = Object.freeze({
  enabled: false,
  token: null,
});

export const DEFAULT_EXECUTION_POLICY: ExecutionPolicy = Object.freeze({
  allowStreaming: false,
  allowTools: false,
  requireProvider: true,
});
