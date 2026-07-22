import type { ExerciseProgression } from "../models/ExerciseProgression";
import type { ProgressionContext } from "../models/ProgressionContext";
import type { ProgressionReason } from "../models/ProgressionReason";
import type { ProgressionStep } from "../models/ProgressionStep";
import { calculateProgressionScore } from "../utils/calculateProgressionScore";
import {
  freezeExerciseProgression,
  freezeProgressionStep,
} from "../utils/freezeProgressionPlan";
import type { ProgressionStrategy } from "./ProgressionStrategy";

/**
 * Evolves intensity targets (RPE / RIR) deterministically across weeks.
 * Never predicts absolute load. Never autoregulates from readiness.
 */
export class IntensityProgressionStrategy implements ProgressionStrategy {
  readonly id = "intensity";

  apply(
    progression: ExerciseProgression,
    _context: ProgressionContext,
  ): ExerciseProgression {
    const metric = progression.baselineIntensityMetric;
    const baseline = progression.baselineIntensityValue;

    const steps = progression.steps.map((step, index) => {
      const intensityValue = progressIntensity(metric, baseline, index);

      const reason: ProgressionReason = Object.freeze({
        code: "intensity_progression",
        weight: index * 0.5,
        detail: `${metric}:${intensityValue ?? "none"}`,
      });

      return freezeProgressionStep({
        ...step,
        target: Object.freeze({
          ...step.target,
          intensityMetric: metric,
          intensityValue,
        }),
        expectedIntensityTrend:
          index === 0
            ? ("stable" as const)
            : intensityValue !== baseline
              ? ("increasing" as const)
              : ("stable" as const),
        notes: Object.freeze([
          ...step.notes,
          index === 0 ? "intensity_baseline" : "intensity_progressed",
        ]),
        score: calculateProgressionScore({
          ...step.score,
          intensity: intensityValue ?? 0,
        }),
        reasons: Object.freeze([...step.reasons, reason]),
      });
    });

    const last = steps[steps.length - 1]!;
    const reason: ProgressionReason = Object.freeze({
      code: "intensity_progression_applied",
      weight: last.target.intensityValue ?? 0,
      detail: `${progression.exerciseId}:${metric}:${last.target.intensityValue}`,
    });

    return freezeExerciseProgression({
      ...progression,
      steps: Object.freeze(steps as ProgressionStep[]),
      score: calculateProgressionScore({
        ...progression.score,
        intensity: last.target.intensityValue ?? 0,
      }),
      reasons: Object.freeze([...progression.reasons, reason]),
    });
  }
}

function progressIntensity(
  metric: ExerciseProgression["baselineIntensityMetric"],
  baseline: number | null,
  weekOffset: number,
): number | null {
  if (metric === "none" || baseline === null) {
    return baseline;
  }

  if (metric === "rpe") {
    const bump = Math.floor(weekOffset / 2) * 0.5;
    return Math.min(10, Math.round((baseline + bump) * 10) / 10);
  }

  // rir — lower RIR is higher intensity
  const reduction = Math.floor(weekOffset / 2);
  return Math.max(0, baseline - reduction);
}
