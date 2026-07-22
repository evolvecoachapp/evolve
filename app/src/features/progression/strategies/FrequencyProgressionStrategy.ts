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
 * Records planned frequency evolution across the window.
 * Informational only — does not assemble sessions or change exercise continuity.
 */
export class FrequencyProgressionStrategy implements ProgressionStrategy {
  readonly id = "frequency";

  apply(
    progression: ExerciseProgression,
    context: ProgressionContext,
  ): ExerciseProgression {
    const baseFrequency = Math.max(1, context.weeklyFrequency);

    const steps = progression.steps.map((step, index) => {
      // Mild late-window bump for primary lifts only; otherwise stable.
      const bump =
        progression.role === "primary" && index >= Math.floor(progression.steps.length / 2)
          ? 1
          : 0;
      const frequencySessionsPerWeek = Math.min(6, baseFrequency + bump);

      const reason: ProgressionReason = Object.freeze({
        code: "frequency_progression",
        weight: frequencySessionsPerWeek,
        detail: `sessions_per_week:${frequencySessionsPerWeek}`,
      });

      return freezeProgressionStep({
        ...step,
        target: Object.freeze({
          ...step.target,
          frequencySessionsPerWeek,
        }),
        notes: Object.freeze([
          ...step.notes,
          bump > 0 ? "frequency_increased" : "frequency_stable",
        ]),
        score: calculateProgressionScore({
          ...step.score,
          frequency: frequencySessionsPerWeek,
        }),
        reasons: Object.freeze([...step.reasons, reason]),
      });
    });

    const last = steps[steps.length - 1]!;
    const reason: ProgressionReason = Object.freeze({
      code: "frequency_progression_applied",
      weight: last.target.frequencySessionsPerWeek,
      detail: `${progression.exerciseId}:${last.target.frequencySessionsPerWeek}`,
    });

    return freezeExerciseProgression({
      ...progression,
      steps: Object.freeze(steps as ProgressionStep[]),
      score: calculateProgressionScore({
        ...progression.score,
        frequency: last.target.frequencySessionsPerWeek,
      }),
      reasons: Object.freeze([...progression.reasons, reason]),
    });
  }
}
