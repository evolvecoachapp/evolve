import type { ProgressionPlan } from "../../progression/models/ProgressionPlan";
import type { AdaptationContext } from "../models/AdaptationContext";
import type { AdaptationReason } from "../models/AdaptationReason";
import type {
  FatigueAssessment,
  FatigueLevel,
} from "../models/FatigueAssessment";
import type { AssessmentStrategy } from "./AssessmentStrategy";

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/**
 * Derive fatigue level from progression volume/intensity structure.
 * No heart rate. No physiological calculations.
 */
export class FatigueAssessmentStrategy
  implements AssessmentStrategy<FatigueAssessment>
{
  readonly id = "fatigue";

  assess(
    context: AdaptationContext,
    plan: ProgressionPlan,
  ): FatigueAssessment {
    const volumePressure = context.averageVolumeSets * 8;
    const intensityPressure = context.peakIntensityValue * 4;
    const progressionPressure = Math.min(40, plan.score.total * 0.5);
    const rawScore = clamp(
      volumePressure + intensityPressure + progressionPressure,
      0,
      100,
    );
    const score = round3(rawScore);
    const level = resolveLevel(score);

    const reasons: readonly AdaptationReason[] = Object.freeze([
      Object.freeze({
        code: "fatigue_from_volume",
        weight: volumePressure,
        detail: `avg_sets_${context.averageVolumeSets}`,
      }),
      Object.freeze({
        code: "fatigue_level",
        weight: score,
        detail: level,
      }),
    ]);

    return Object.freeze({
      level,
      score,
      reasons,
    });
  }
}

function resolveLevel(score: number): FatigueLevel {
  if (score < 25) {
    return "low";
  }
  if (score < 50) {
    return "moderate";
  }
  if (score < 75) {
    return "high";
  }
  return "excessive";
}
