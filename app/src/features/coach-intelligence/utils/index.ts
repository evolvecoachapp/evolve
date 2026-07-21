export { roundToTwo, clamp, daysBetween } from "./math";
export {
  detectVolumeTrend,
  detectFrequencyTrend,
  type DetectTrendOptions,
} from "./detectVolumeTrend";
export { scoreTrainingConsistency } from "./scoreTrainingConsistency";
export {
  detectRecentPR,
  type DetectRecentPROptions,
} from "./detectRecentPR";
export {
  detectExercisePlateau,
  type DetectExercisePlateauOptions,
} from "./detectExercisePlateau";
export {
  detectInactivity,
  type DetectInactivityOptions,
} from "./detectInactivity";
export {
  detectRecoveryRisk,
  type DetectRecoveryRiskOptions,
  type RecoveryRiskResult,
} from "./detectRecoveryRisk";
export {
  buildRecommendations,
  type BuildRecommendationsInput,
} from "./buildRecommendations";
export {
  buildCoachSummary,
  type BuildCoachSummaryInput,
} from "./buildCoachSummary";
export {
  buildProgressStatus,
  buildStagnationRisk,
  buildInactivityRisk,
  buildHighFrequencyRisk,
  type BuildProgressStatusInput,
} from "./buildSignals";
