import type { RecoveryConfidence } from "./RecoveryConfidence";
import type { RecoveryScore } from "./RecoveryScore";
import type { ReadinessState } from "./ReadinessState";
import type { FatigueState } from "./FatigueState";
import type { SleepProfile } from "./SleepProfile";
import type { StressProfile } from "./StressProfile";
import type { TrainingLoad } from "./TrainingLoad";
import type { RecoveryIndicators } from "./RecoveryIndicators";
import type { DeloadRecommendation } from "./DeloadRecommendation";

/**
 * Immutable recovery assessment produced by planners / builders.
 */
export interface RecoveryAssessment {
  readonly id: string;
  readonly recoveryScore: RecoveryScore;
  readonly readiness: ReadinessState;
  readonly fatigue: FatigueState;
  readonly sleep: SleepProfile;
  readonly stress: StressProfile;
  readonly trainingLoad: TrainingLoad;
  readonly indicators: RecoveryIndicators;
  readonly deload: DeloadRecommendation;
  readonly confidence: RecoveryConfidence;
  readonly summary: string;
  readonly assessedAt: string;
}
