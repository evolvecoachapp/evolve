import type { WorkoutExperienceLevel } from "../models/WorkoutRequest";
import type { WorkoutObjective } from "../models/WorkoutObjective";
import { WorkoutObjectives } from "../models/WorkoutObjective";

export interface TrainingMetrics {
  readonly volumeScore: number;
  readonly intensityScore: number;
  readonly frequencyScore: number;
  readonly fatigueScore: number;
  readonly recoveryScore: number;
}

export function computeTrainingMetrics(input: {
  readonly daysPerWeek: number;
  readonly objective: WorkoutObjective;
  readonly experienceLevel: WorkoutExperienceLevel;
  readonly recoveryFlag?: boolean;
}): TrainingMetrics {
  const frequencyScore = clamp(input.daysPerWeek / 7, 0, 1);
  const volumeBase = volumeForObjective(input.objective);
  const intensityBase = intensityForObjective(input.objective);
  const experienceFactor =
    input.experienceLevel === "beginner"
      ? 0.75
      : input.experienceLevel === "advanced"
        ? 1.1
        : 1;
  const recoveryPenalty = input.recoveryFlag ? 0.15 : 0;

  const volumeScore = clamp(volumeBase * experienceFactor - recoveryPenalty, 0, 1);
  const intensityScore = clamp(
    intensityBase * experienceFactor - recoveryPenalty * 0.5,
    0,
    1,
  );
  const fatigueScore = clamp(
    (volumeScore + intensityScore + frequencyScore) / 3,
    0,
    1,
  );
  const recoveryScore = clamp(1 - fatigueScore + (input.recoveryFlag ? 0.2 : 0), 0, 1);

  return Object.freeze({
    volumeScore: round3(volumeScore),
    intensityScore: round3(intensityScore),
    frequencyScore: round3(frequencyScore),
    fatigueScore: round3(fatigueScore),
    recoveryScore: round3(recoveryScore),
  });
}

function volumeForObjective(objective: WorkoutObjective): number {
  switch (objective) {
    case WorkoutObjectives.HYPERTROPHY:
      return 0.85;
    case WorkoutObjectives.POWERBUILDING:
      return 0.75;
    case WorkoutObjectives.STRENGTH:
    case WorkoutObjectives.POWERLIFTING:
      return 0.6;
    case WorkoutObjectives.RECOVERY:
      return 0.35;
    case WorkoutObjectives.GENERAL_FITNESS:
      return 0.65;
    default:
      return 0.5;
  }
}

function intensityForObjective(objective: WorkoutObjective): number {
  switch (objective) {
    case WorkoutObjectives.POWERLIFTING:
      return 0.9;
    case WorkoutObjectives.STRENGTH:
      return 0.85;
    case WorkoutObjectives.POWERBUILDING:
      return 0.75;
    case WorkoutObjectives.HYPERTROPHY:
      return 0.65;
    case WorkoutObjectives.RECOVERY:
      return 0.3;
    case WorkoutObjectives.GENERAL_FITNESS:
      return 0.55;
    default:
      return 0.5;
  }
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}

function round3(n: number): number {
  return Math.round(n * 1000) / 1000;
}
