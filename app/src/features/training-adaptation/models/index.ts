export type { AdaptationReason } from "./AdaptationReason";

export type { AdaptationScore } from "./AdaptationScore";
export { createEmptyAdaptationScore } from "./AdaptationScore";

export type {
  TrainingConstraint,
  TrainingConstraintSeverity,
  TrainingConstraintSource,
} from "./TrainingConstraint";
export {
  TRAINING_CONSTRAINT_SEVERITIES,
  TRAINING_CONSTRAINT_SOURCES,
} from "./TrainingConstraint";

export type {
  RecoveryAssessment,
  RecoveryStatus,
} from "./RecoveryAssessment";
export { RECOVERY_STATUSES } from "./RecoveryAssessment";

export type { FatigueAssessment, FatigueLevel } from "./FatigueAssessment";
export { FATIGUE_LEVELS } from "./FatigueAssessment";

export type { ConstraintAssessment } from "./ConstraintAssessment";

export type { ReadinessAssessment } from "./ReadinessAssessment";

export type {
  AdaptationAction,
  AdaptationActionKind,
} from "./AdaptationAction";
export { ADAPTATION_ACTION_KINDS } from "./AdaptationAction";

export type { AdaptationRecommendation } from "./AdaptationRecommendation";

export type { AdaptedProgression } from "./AdaptedProgression";

export type { AdaptationExplanation } from "./AdaptationExplanation";

export type { AdaptationContext } from "./AdaptationContext";

export type { TrainingAdaptationRequest } from "./TrainingAdaptationRequest";

export type { TrainingAdaptationResult } from "./TrainingAdaptationResult";

export { TrainingAdaptationError } from "./TrainingAdaptationError";
