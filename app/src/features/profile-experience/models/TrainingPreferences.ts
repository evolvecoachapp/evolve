export const TrainingLevelValues = {
  BEGINNER: "beginner",
  INTERMEDIATE: "intermediate",
  ADVANCED: "advanced",
  ELITE: "elite",
} as const;

export type TrainingLevel = (typeof TrainingLevelValues)[keyof typeof TrainingLevelValues];

export interface TrainingPreferences {
  readonly level: TrainingLevel;
  readonly sessionsPerWeek: number;
  readonly preferredDuration: number;
  readonly preferredTime: string;
  readonly focusAreas: readonly string[];
  readonly equipmentAvailable: readonly string[];
  readonly destination: string | null;
}

export function createTrainingPreferences(input: TrainingPreferences): TrainingPreferences {
  return Object.freeze({
    ...input,
    focusAreas: Object.freeze([...input.focusAreas]),
    equipmentAvailable: Object.freeze([...input.equipmentAvailable]),
  });
}
