import type { ExercisePrescription } from "../../programming/models/ExercisePrescription";
import type { ExerciseProgression } from "../models/ExerciseProgression";
import type { ProgressionContext } from "../models/ProgressionContext";
import type { ProgressionStep } from "../models/ProgressionStep";
import { createEmptyProgressionScore } from "../models/ProgressionScore";
import { freezeExerciseProgression } from "./freezeProgressionPlan";
import { sortTimeline } from "./sortTimeline";

/**
 * Create a baseline ExerciseProgression skeleton from a programmed prescription.
 * Strategies evolve targets across weeks; week 1 mirrors the prescription.
 */
export function normalizeExerciseProgression(
  prescription: ExercisePrescription,
  context: ProgressionContext,
): ExerciseProgression {
  const { startWeek, weekCount } = context.window;
  const steps: ProgressionStep[] = [];

  for (let offset = 0; offset < weekCount; offset += 1) {
    const weekNumber = startWeek + offset;
    steps.push(
      Object.freeze({
        weekNumber,
        exerciseId: prescription.exerciseId,
        prescriptionOrder: prescription.order,
        role: prescription.role,
        target: Object.freeze({
          volumeSets: prescription.volume.sets,
          volumeRepMin: prescription.volume.repMin,
          volumeRepMax: prescription.volume.repMax,
          intensityMetric: prescription.intensity.metric,
          intensityValue: prescription.intensity.value,
          frequencySessionsPerWeek: context.weeklyFrequency,
          rotationIndex: 0,
        }),
        expectedDifficultyTrend: "stable" as const,
        expectedVolumeTrend: "stable" as const,
        expectedIntensityTrend: "stable" as const,
        notes: Object.freeze([] as string[]),
        score: createEmptyProgressionScore(),
        reasons: Object.freeze([]),
      }),
    );
  }

  return freezeExerciseProgression({
    exerciseId: prescription.exerciseId,
    prescriptionOrder: prescription.order,
    role: prescription.role,
    baselineSets: prescription.volume.sets,
    baselineRepMin: prescription.volume.repMin,
    baselineRepMax: prescription.volume.repMax,
    baselineIntensityMetric: prescription.intensity.metric,
    baselineIntensityValue: prescription.intensity.value,
    steps: Object.freeze(steps),
    score: createEmptyProgressionScore(),
    reasons: Object.freeze([]),
  });
}

/**
 * Flatten exercise progressions into a normalized week-ordered timeline.
 */
export function normalizeTimeline(
  progressions: readonly ExerciseProgression[],
): readonly ProgressionStep[] {
  const steps = progressions.flatMap((progression) => progression.steps);
  return sortTimeline(steps);
}

/**
 * Replace steps on an exercise progression and freeze the result.
 */
export function withUpdatedSteps(
  progression: ExerciseProgression,
  steps: readonly ProgressionStep[],
): ExerciseProgression {
  return freezeExerciseProgression({
    ...progression,
    steps: Object.freeze([...steps]),
  });
}
