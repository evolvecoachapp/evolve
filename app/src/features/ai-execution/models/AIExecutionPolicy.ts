import type { CancellationPolicy } from "../policies/CancellationPolicy";
import type { ExecutionPolicy } from "../policies/ExecutionPolicy";
import type { RetryPolicy } from "../policies/RetryPolicy";
import type { TimeoutPolicy } from "../policies/TimeoutPolicy";
import {
  DEFAULT_CANCELLATION_POLICY,
  DEFAULT_EXECUTION_POLICY,
  DEFAULT_RETRY_POLICY,
  DEFAULT_TIMEOUT_POLICY,
} from "../policies/defaults";

/**
 * Immutable policy bundle attached to an execution.
 *
 * Interfaces only — no retry / timeout / cancellation algorithms yet.
 */
export interface AIExecutionPolicy {
  readonly retry: RetryPolicy;
  readonly timeout: TimeoutPolicy;
  readonly cancellation: CancellationPolicy;
  readonly execution: ExecutionPolicy;
}

export const DEFAULT_AI_EXECUTION_POLICY: AIExecutionPolicy = Object.freeze({
  retry: DEFAULT_RETRY_POLICY,
  timeout: DEFAULT_TIMEOUT_POLICY,
  cancellation: DEFAULT_CANCELLATION_POLICY,
  execution: DEFAULT_EXECUTION_POLICY,
});
