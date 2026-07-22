import type { ConstraintAssessment } from "../models/ConstraintAssessment";
import type { FatigueAssessment } from "../models/FatigueAssessment";
import type { ReadinessAssessment } from "../models/ReadinessAssessment";
import type { RecoveryAssessment } from "../models/RecoveryAssessment";
import type { AdaptationReason } from "../models/AdaptationReason";

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Aggregate independent assessments into a single readiness assessment.
 * Deterministic only — no physiological inputs.
 */
export function aggregateAssessments(input: {
  readonly recovery: RecoveryAssessment;
  readonly fatigue: FatigueAssessment;
  readonly constraints: ConstraintAssessment;
  readonly executionConfidence: number;
}): ReadinessAssessment {
  const overallScore = round3(
    clamp(
      input.recovery.score * 0.35 +
        (100 - input.fatigue.score) * 0.35 +
        input.constraints.score * 0.15 +
        input.executionConfidence * 0.15,
      0,
      100,
    ),
  );

  const reasons: readonly AdaptationReason[] = Object.freeze([
    ...input.recovery.reasons,
    ...input.fatigue.reasons,
    ...input.constraints.reasons,
    Object.freeze({
      code: "readiness_aggregated",
      weight: overallScore,
      detail: `overall_${overallScore}`,
    }),
  ]);

  return Object.freeze({
    recovery: input.recovery,
    fatigue: input.fatigue,
    constraints: input.constraints,
    executionConfidence: round3(clamp(input.executionConfidence, 0, 100)),
    overallScore,
    reasons,
  });
}

/**
 * Calculate a readiness score from assessment axes (0–100).
 */
export function calculateReadinessScore(input: {
  readonly recoveryScore: number;
  readonly fatigueScore: number;
  readonly constraintScore: number;
  readonly executionConfidence: number;
}): number {
  return round3(
    clamp(
      input.recoveryScore * 0.35 +
        (100 - input.fatigueScore) * 0.35 +
        input.constraintScore * 0.15 +
        input.executionConfidence * 0.15,
      0,
      100,
    ),
  );
}
