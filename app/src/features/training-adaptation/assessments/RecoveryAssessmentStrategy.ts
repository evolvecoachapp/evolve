import type { ProgressionPlan } from "../../progression/models/ProgressionPlan";
import type { AdaptationContext } from "../models/AdaptationContext";
import type { AdaptationReason } from "../models/AdaptationReason";
import type {
  RecoveryAssessment,
  RecoveryStatus,
} from "../models/RecoveryAssessment";
import type { AssessmentStrategy } from "./AssessmentStrategy";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/**
 * Derive recovery status from structural plan density.
 * Higher weekly frequency and more weeks reduce recovery score.
 * No wearables / sleep / HRV.
 */
export class RecoveryAssessmentStrategy
  implements AssessmentStrategy<RecoveryAssessment>
{
  readonly id = "recovery";

  assess(
    context: AdaptationContext,
    _plan: ProgressionPlan,
  ): RecoveryAssessment {
    const frequencyPressure = Math.max(0, context.weeklyFrequency - 3) * 12;
    const weekPressure = Math.max(0, context.weekCount - 4) * 5;
    const constraintPressure = context.constraints.length * 3;
    const rawScore = clamp(
      100 - frequencyPressure - weekPressure - constraintPressure,
      0,
      100,
    );
    const score = round3(rawScore);
    const status = resolveStatus(score);

    const reasons: readonly AdaptationReason[] = Object.freeze([
      Object.freeze({
        code: "recovery_from_frequency",
        weight: frequencyPressure,
        detail: `weekly_frequency_${context.weeklyFrequency}`,
      }),
      Object.freeze({
        code: "recovery_status",
        weight: score,
        detail: status,
      }),
    ]);

    return Object.freeze({
      status,
      score,
      reasons,
    });
  }
}

function resolveStatus(score: number): RecoveryStatus {
  if (score >= 70) {
    return "adequate";
  }
  if (score >= 40) {
    return "limited";
  }
  return "insufficient";
}
