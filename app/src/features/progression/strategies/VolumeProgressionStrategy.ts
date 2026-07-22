import type { CandidateRole } from "../../exercise-selection/models/CandidateRole";
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

const ROLE_SET_CADENCE: Record<CandidateRole, number> = {
  primary: 2,
  secondary: 2,
  accessory: 3,
};

/**
 * Evolves volume (sets / reps) deterministically across weeks.
 * No deload. No athlete feedback. No absolute load.
 */
export class VolumeProgressionStrategy implements ProgressionStrategy {
  readonly id = "volume";

  apply(
    progression: ExerciseProgression,
    _context: ProgressionContext,
  ): ExerciseProgression {
    const cadence = ROLE_SET_CADENCE[progression.role] ?? 2;
    let cumulativeSetBonus = 0;
    let cumulativeRepBonus = 0;

    const steps = progression.steps.map((step, index) => {
      if (index > 0 && index % cadence === 0) {
        cumulativeSetBonus += 1;
      }
      if (index > 0) {
        cumulativeRepBonus += 1;
      }

      const volumeSets = Math.min(
        8,
        progression.baselineSets + cumulativeSetBonus,
      );
      const volumeRepMin = progression.baselineRepMin;
      const volumeRepMax = Math.min(
        30,
        progression.baselineRepMax + cumulativeRepBonus,
      );

      const volumeChanged =
        volumeSets !== step.target.volumeSets ||
        volumeRepMax !== step.target.volumeRepMax;

      const reason: ProgressionReason = Object.freeze({
        code: "volume_progression",
        weight: cumulativeSetBonus + cumulativeRepBonus * 0.1,
        detail: `${volumeSets}x${volumeRepMin}-${volumeRepMax}`,
      });

      return freezeProgressionStep({
        ...step,
        target: Object.freeze({
          ...step.target,
          volumeSets,
          volumeRepMin,
          volumeRepMax,
        }),
        expectedVolumeTrend:
          index === 0
            ? ("stable" as const)
            : volumeChanged
              ? ("increasing" as const)
              : step.expectedVolumeTrend,
        notes: Object.freeze([
          ...step.notes,
          index === 0 ? "volume_baseline" : "volume_progressed",
        ]),
        score: calculateProgressionScore({
          ...step.score,
          volume: volumeSets + (volumeRepMax - volumeRepMin) * 0.1,
        }),
        reasons: Object.freeze([...step.reasons, reason]),
      });
    });

    const last = steps[steps.length - 1]!;
    const reason: ProgressionReason = Object.freeze({
      code: "volume_progression_applied",
      weight: last.target.volumeSets,
      detail: `${progression.exerciseId}:peak_${last.target.volumeSets}x${last.target.volumeRepMax}`,
    });

    return freezeExerciseProgression({
      ...progression,
      steps: Object.freeze(steps as ProgressionStep[]),
      score: calculateProgressionScore({
        ...progression.score,
        volume: last.target.volumeSets,
      }),
      reasons: Object.freeze([...progression.reasons, reason]),
    });
  }
}
