import type { FailurePolicy } from "../policies/FailurePolicy";
import { DefaultFailurePolicy } from "../policies/FailurePolicy";
import type { OrderingPolicy } from "../policies/OrderingPolicy";
import { DefaultOrderingPolicy } from "../policies/OrderingPolicy";
import type { RecoveryPolicy } from "../policies/RecoveryPolicy";
import { DefaultRecoveryPolicy } from "../policies/RecoveryPolicy";
import type { RetryPolicy } from "../policies/RetryPolicy";
import { DefaultRetryPolicy } from "../policies/RetryPolicy";
import type { SafetyPolicy } from "../policies/SafetyPolicy";
import { DefaultSafetyPolicy } from "../policies/SafetyPolicy";
import type { TimeoutPolicy } from "../policies/TimeoutPolicy";
import { DefaultTimeoutPolicy } from "../policies/TimeoutPolicy";

export interface PolicyBundle {
  readonly retry: RetryPolicy;
  readonly timeout: TimeoutPolicy;
  readonly ordering: OrderingPolicy;
  readonly failure: FailurePolicy;
  readonly recovery: RecoveryPolicy;
  readonly safety: SafetyPolicy;
}

/**
 * Deterministic policy selection.
 */
export class PolicySelector {
  readonly id = "selector:policy:default";

  selectDefaults(): PolicyBundle {
    return Object.freeze({
      retry: new DefaultRetryPolicy(),
      timeout: new DefaultTimeoutPolicy(),
      ordering: new DefaultOrderingPolicy(),
      failure: new DefaultFailurePolicy(),
      recovery: new DefaultRecoveryPolicy(),
      safety: new DefaultSafetyPolicy(),
    });
  }

  listPolicyIds(bundle: PolicyBundle = this.selectDefaults()): readonly string[] {
    return Object.freeze([
      bundle.retry.id,
      bundle.timeout.id,
      bundle.ordering.id,
      bundle.failure.id,
      bundle.recovery.id,
      bundle.safety.id,
    ]);
  }
}
