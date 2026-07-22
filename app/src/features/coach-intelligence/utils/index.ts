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

export { aggregateKnowledge } from "./aggregateKnowledge";
export {
  freezeConstraint,
  freezeContext,
  freezeCoachingContextSummary,
  freezeEngineResult,
  freezeEvidence,
  freezeFocus,
  freezeInstruction,
  freezeKnowledge,
  freezeObjective,
  freezePreparation,
  freezeSession,
  freezeSnapshot,
} from "./freezeContext";
export { formatCountPhrase, formatIntentLabel } from "./formatting";
export {
  normalizeConstraintPriorities,
  normalizeEvidencePriorities,
  normalizeFocusPriorities,
  normalizeInstructionPriorities,
  normalizeObjectivePriorities,
  normalizePriority,
} from "./normalizePriorities";
export {
  sortConstraints,
  sortEvidence,
  sortFocus,
  sortInstructions,
  sortObjectives,
} from "./sortEvidence";
export {
  buildCoachingContextSummary,
  summarizeFromContext,
} from "./summarizeContext";
