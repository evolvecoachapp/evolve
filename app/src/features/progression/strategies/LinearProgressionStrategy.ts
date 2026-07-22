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
 * Applies a deterministic linear difficulty trend across the window.
 * Does not change loads — only expected difficulty trend and notes.
 */
export class LinearProgressionStrategy implements ProgressionStrategy {
  readonly id = "linear";

  apply(
    progression: ExerciseProgression,
    _context: ProgressionContext,
  ): ExerciseProgression {
    const weekCount = progression.steps.length;
    const steps = progression.steps.map((step, index) => {
      const trend =
        weekCount <= 1
          ? ("stable" as const)
          : index === 0
            ? ("stable" as const)
            : ("increasing" as const);

      const reason: ProgressionReason = Object.freeze({
        code: "linear_difficulty_trend",
        weight: index,
        detail: `week_${step.weekNumber}:${trend}`,
      });

      const note =
        index === 0
          ? "baseline_week"
          : `linear_progression_week_${step.weekNumber}`;

      return freezeProgressionStep({
        ...step,
        expectedDifficultyTrend: trend,
        notes: Object.freeze([...step.notes, note]),
        score: calculateProgressionScore({
          ...step.score,
          linear: index * 0.5,
        }),
        reasons: Object.freeze([...step.reasons, reason]),
      });
    });

    const reason: ProgressionReason = Object.freeze({
      code: "linear_progression_applied",
      weight: weekCount,
      detail: `${progression.exerciseId}:${weekCount}_weeks`,
    });

    return freezeExerciseProgression({
      ...progression,
      steps: Object.freeze(steps as ProgressionStep[]),
      score: calculateProgressionScore({
        ...progression.score,
        linear: Math.max(0, weekCount - 1),
      }),
      reasons: Object.freeze([...progression.reasons, reason]),
    });
  }
}
