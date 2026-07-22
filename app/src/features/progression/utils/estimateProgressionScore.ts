import type { ExerciseProgression } from "../models/ExerciseProgression";
import type { ProgressionStep } from "../models/ProgressionStep";
import { calculateProgressionScore } from "./calculateProgressionScore";

/**
 * Estimate an overall progression score from exercise progressions.
 * Deterministic aggregate — not athlete performance.
 */
export function estimateProgressionScore(
  progressions: readonly ExerciseProgression[],
): ReturnType<typeof calculateProgressionScore> {
  if (progressions.length === 0) {
    return calculateProgressionScore({});
  }

  const totals = progressions.reduce(
    (acc, progression) => ({
      linear: acc.linear + progression.score.linear,
      volume: acc.volume + progression.score.volume,
      intensity: acc.intensity + progression.score.intensity,
      frequency: acc.frequency + progression.score.frequency,
      rotation: acc.rotation + progression.score.rotation,
    }),
    {
      linear: 0,
      volume: 0,
      intensity: 0,
      frequency: 0,
      rotation: 0,
    },
  );

  const count = progressions.length;
  return calculateProgressionScore({
    linear: Math.round((totals.linear / count) * 1000) / 1000,
    volume: Math.round((totals.volume / count) * 1000) / 1000,
    intensity: Math.round((totals.intensity / count) * 1000) / 1000,
    frequency: Math.round((totals.frequency / count) * 1000) / 1000,
    rotation: Math.round((totals.rotation / count) * 1000) / 1000,
  });
}

/**
 * Estimate a simple workload trend index across a timeline.
 * Higher values mean more planned volume × intensity pressure.
 * Never absolute load. Never athlete-derived.
 */
export function estimateWorkloadTrend(
  steps: readonly ProgressionStep[],
): number {
  if (steps.length === 0) {
    return 0;
  }

  let total = 0;
  for (const step of steps) {
    const midReps = (step.target.volumeRepMin + step.target.volumeRepMax) / 2;
    const intensity = step.target.intensityValue ?? 5;
    total += step.target.volumeSets * midReps * intensity;
  }

  return Math.round((total / steps.length) * 1000) / 1000;
}
