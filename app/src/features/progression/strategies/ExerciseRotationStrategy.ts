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
 * Marks deterministic exercise rotation slots across weeks.
 * Preserves exercise continuity (same exerciseId) — variation intent only.
 * Does not swap exercises or break timeline continuity.
 */
export class ExerciseRotationStrategy implements ProgressionStrategy {
  readonly id = "exercise_rotation";

  apply(
    progression: ExerciseProgression,
    _context: ProgressionContext,
  ): ExerciseProgression {
    // Accessories rotate more often; primaries stay on slot 0.
    const period =
      progression.role === "accessory"
        ? 2
        : progression.role === "secondary"
          ? 3
          : Number.POSITIVE_INFINITY;

    const steps = progression.steps.map((step, index) => {
      const rotationIndex =
        Number.isFinite(period) && period > 0
          ? index % period
          : 0;

      const reason: ProgressionReason = Object.freeze({
        code: "exercise_rotation_slot",
        weight: rotationIndex,
        detail: `slot_${rotationIndex}`,
      });

      return freezeProgressionStep({
        ...step,
        target: Object.freeze({
          ...step.target,
          rotationIndex,
        }),
        notes: Object.freeze([
          ...step.notes,
          rotationIndex === 0 ? "rotation_primary_slot" : `rotation_slot_${rotationIndex}`,
        ]),
        score: calculateProgressionScore({
          ...step.score,
          rotation: rotationIndex,
        }),
        reasons: Object.freeze([...step.reasons, reason]),
      });
    });

    const uniqueSlots = new Set(steps.map((step) => step.target.rotationIndex))
      .size;
    const reason: ProgressionReason = Object.freeze({
      code: "exercise_rotation_applied",
      weight: uniqueSlots,
      detail: `${progression.exerciseId}:slots_${uniqueSlots}`,
    });

    return freezeExerciseProgression({
      ...progression,
      steps: Object.freeze(steps as ProgressionStep[]),
      score: calculateProgressionScore({
        ...progression.score,
        rotation: uniqueSlots,
      }),
      reasons: Object.freeze([...progression.reasons, reason]),
    });
  }
}
