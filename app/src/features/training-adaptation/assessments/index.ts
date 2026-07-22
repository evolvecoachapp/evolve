import { ConstraintAssessmentStrategy } from "./ConstraintAssessmentStrategy";
import { ExecutionReadinessStrategy } from "./ExecutionReadinessStrategy";
import { FatigueAssessmentStrategy } from "./FatigueAssessmentStrategy";
import { RecoveryAssessmentStrategy } from "./RecoveryAssessmentStrategy";
import type { AssessmentStrategy } from "./AssessmentStrategy";

export type { AssessmentStrategy } from "./AssessmentStrategy";
export { RecoveryAssessmentStrategy } from "./RecoveryAssessmentStrategy";
export { FatigueAssessmentStrategy } from "./FatigueAssessmentStrategy";
export { ConstraintAssessmentStrategy } from "./ConstraintAssessmentStrategy";
export {
  ExecutionReadinessStrategy,
  type ExecutionConfidenceAssessment,
} from "./ExecutionReadinessStrategy";

export interface DefaultAssessments {
  readonly recovery: RecoveryAssessmentStrategy;
  readonly fatigue: FatigueAssessmentStrategy;
  readonly constraint: ConstraintAssessmentStrategy;
  readonly execution: ExecutionReadinessStrategy;
}

/**
 * Default independent assessment suite.
 */
export function createDefaultAssessments(): DefaultAssessments {
  return Object.freeze({
    recovery: new RecoveryAssessmentStrategy(),
    fatigue: new FatigueAssessmentStrategy(),
    constraint: new ConstraintAssessmentStrategy(),
    execution: new ExecutionReadinessStrategy(),
  });
}

export function listDefaultAssessmentStrategies(): readonly AssessmentStrategy<unknown>[] {
  const defaults = createDefaultAssessments();
  return Object.freeze([
    defaults.recovery,
    defaults.fatigue,
    defaults.constraint,
    defaults.execution,
  ]);
}
