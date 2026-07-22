import type { AdaptedProgression } from "../models/AdaptedProgression";
import type { AdaptationContext } from "../models/AdaptationContext";
import type { AdaptationExplanation } from "../models/AdaptationExplanation";
import type { AdaptationRecommendation } from "../models/AdaptationRecommendation";
import type { AdaptationScore } from "../models/AdaptationScore";
import type { ConstraintAssessment } from "../models/ConstraintAssessment";
import type { FatigueAssessment } from "../models/FatigueAssessment";
import type { ReadinessAssessment } from "../models/ReadinessAssessment";
import type { RecoveryAssessment } from "../models/RecoveryAssessment";
import type { TrainingAdaptationResult } from "../models/TrainingAdaptationResult";
import { normalizeRecommendation } from "./normalizeRecommendations";

/**
 * Deep-freeze a TrainingAdaptationResult for immutability guarantees.
 */
export function freezeTrainingAdaptationResult(
  result: TrainingAdaptationResult,
): TrainingAdaptationResult {
  return Object.freeze({
    requestId: result.requestId,
    context: freezeContext(result.context),
    readiness: freezeReadiness(result.readiness),
    recommendations: Object.freeze(
      result.recommendations.map(normalizeRecommendation),
    ),
    adaptedProgression: freezeAdaptedProgression(result.adaptedProgression),
    explanations: Object.freeze(result.explanations.map(freezeExplanation)),
    validationIssues: Object.freeze([...result.validationIssues]),
    score: freezeScore(result.score),
    adaptedAt: result.adaptedAt,
  });
}

export function freezeAdaptedProgression(
  adapted: AdaptedProgression,
): AdaptedProgression {
  return Object.freeze({
    sourcePlanRequestId: adapted.sourcePlanRequestId,
    readinessScore: adapted.readinessScore,
    appliedRecommendationIds: Object.freeze([
      ...adapted.appliedRecommendationIds,
    ]),
    notes: Object.freeze([...adapted.notes]),
    sourcePlan: adapted.sourcePlan,
  });
}

export function freezeReadiness(
  readiness: ReadinessAssessment,
): ReadinessAssessment {
  return Object.freeze({
    recovery: freezeRecovery(readiness.recovery),
    fatigue: freezeFatigue(readiness.fatigue),
    constraints: freezeConstraints(readiness.constraints),
    executionConfidence: readiness.executionConfidence,
    overallScore: readiness.overallScore,
    reasons: Object.freeze(
      readiness.reasons.map((reason) => Object.freeze({ ...reason })),
    ),
  });
}

function freezeRecovery(recovery: RecoveryAssessment): RecoveryAssessment {
  return Object.freeze({
    ...recovery,
    reasons: Object.freeze(
      recovery.reasons.map((reason) => Object.freeze({ ...reason })),
    ),
  });
}

function freezeFatigue(fatigue: FatigueAssessment): FatigueAssessment {
  return Object.freeze({
    ...fatigue,
    reasons: Object.freeze(
      fatigue.reasons.map((reason) => Object.freeze({ ...reason })),
    ),
  });
}

function freezeConstraints(
  constraints: ConstraintAssessment,
): ConstraintAssessment {
  return Object.freeze({
    ...constraints,
    blockingCodes: Object.freeze([...constraints.blockingCodes]),
    reasons: Object.freeze(
      constraints.reasons.map((reason) => Object.freeze({ ...reason })),
    ),
  });
}

function freezeContext(context: AdaptationContext): AdaptationContext {
  return Object.freeze({
    ...context,
    focus: Object.freeze({ ...context.focus }),
    priority: Object.freeze({ ...context.priority }),
    constraints: Object.freeze(
      context.constraints.map((constraint) => Object.freeze({ ...constraint })),
    ),
  });
}

function freezeExplanation(
  explanation: AdaptationExplanation,
): AdaptationExplanation {
  return Object.freeze({
    ...explanation,
    score: freezeScore(explanation.score),
    reasons: Object.freeze(
      explanation.reasons.map((reason) => Object.freeze({ ...reason })),
    ),
  });
}

function freezeScore(score: AdaptationScore): AdaptationScore {
  return Object.freeze({ ...score });
}
