export * from "./HRVEvaluator";
export * from "./SleepEvaluator";
export * from "./ConsistencyEvaluator";
export * from "./StressEvaluator";
export * from "./FatigueEvaluator";
export * from "./ReadinessEvaluator";
export * from "./RecoveryEvaluator";

import { evaluateHRV } from "./HRVEvaluator";
import { evaluateSleep } from "./SleepEvaluator";
import { evaluateConsistency } from "./ConsistencyEvaluator";
import { evaluateStress } from "./StressEvaluator";
import { evaluateFatigue } from "./FatigueEvaluator";
import { evaluateReadiness } from "./ReadinessEvaluator";
import { evaluateRecovery } from "./RecoveryEvaluator";

export interface RecoveryEvaluationBundle {
  readonly sleep: ReturnType<typeof evaluateSleep>;
  readonly protocol: ReturnType<typeof evaluateFatigue>;
  readonly stress: ReturnType<typeof evaluateStress>;
  readonly readiness: ReturnType<typeof evaluateReadiness>;
  readonly recovery: ReturnType<typeof evaluateRecovery>;
  readonly hrv: ReturnType<typeof evaluateHRV>;
  readonly consistency: ReturnType<typeof evaluateConsistency>;
}

export function evaluateRecoverySignals(signalKeys: readonly string[]): RecoveryEvaluationBundle {
  return Object.freeze({
    sleep: evaluateSleep(signalKeys),
    protocol: evaluateFatigue(signalKeys),
    stress: evaluateStress(signalKeys),
    readiness: evaluateReadiness(signalKeys),
    recovery: evaluateRecovery(signalKeys),
    hrv: evaluateHRV(signalKeys),
    consistency: evaluateConsistency(signalKeys),
  });
}
