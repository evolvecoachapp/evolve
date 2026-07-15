import type { ExerciseEquipment } from "./ExerciseEquipment";
import type { ExerciseMuscleGroup } from "./ExerciseMuscleGroup";
import type { ExerciseKnowledge } from "./ExerciseKnowledge";

export type ExerciseMetadataDifficulty = "Beginner" | "Intermediate" | "Advanced";

export type ExerciseMetadataMovementPattern =
  | "squat"
  | "hinge"
  | "push"
  | "pull"
  | "carry"
  | "rotation"
  | "compound"
  | "isolation"
  | "mobility";

export interface ExerciseMetadata {
  difficulty?: ExerciseMetadataDifficulty;
  movementPattern?: ExerciseMetadataMovementPattern;
  equipment?: ExerciseEquipment[];
  unilateral?: boolean;
  bodyRegion?: string;
  tempo?: string;
  recommendedRestSeconds?: number;
  coachTip?: string;
  executionSteps?: string[];
  breathingInstructions?: string;
  rangeOfMotion?: string;
  safetyNotes?: string[];
  commonMistakes?: string[];
  primaryMuscles?: ExerciseMuscleGroup[];
  secondaryMuscles?: ExerciseMuscleGroup[];
  stabilizerMuscles?: ExerciseMuscleGroup[];
  /** Professional coaching knowledge — richer, catalog-driven content. */
  knowledge?: ExerciseKnowledge;
}

export function createDefaultExerciseMetadata(
  overrides: Partial<ExerciseMetadata> = {},
): ExerciseMetadata {
  return {
    difficulty: "Beginner",
    movementPattern: "compound",
    equipment: [],
    unilateral: false,
    bodyRegion: "full-body",
    tempo: "2-0-2",
    recommendedRestSeconds: 60,
    coachTip: "",
    executionSteps: [],
    breathingInstructions: "",
    rangeOfMotion: "",
    safetyNotes: [],
    commonMistakes: [],
    primaryMuscles: [],
    secondaryMuscles: [],
    stabilizerMuscles: [],
    knowledge: {
      movementPattern: overrides.movementPattern ?? "compound",
      equipment: overrides.equipment ?? [],
      bodyRegion: overrides.bodyRegion ?? "full-body",
      primaryMuscles: (overrides.primaryMuscles ?? []).map(String),
      secondaryMuscles: (overrides.secondaryMuscles ?? []).map(String),
      stabilizers: (overrides.stabilizerMuscles ?? []).map(String),
      tempo: overrides.tempo ?? "2-0-2",
      recommendedRestSeconds: overrides.recommendedRestSeconds ?? 60,
      coachTip: overrides.coachTip ?? "",
      executionSteps: overrides.executionSteps ?? [],
      breathing: overrides.breathingInstructions ?? "",
      rangeOfMotion: overrides.rangeOfMotion ?? "",
      safetyNotes: overrides.safetyNotes ?? [],
      commonMistakes: overrides.commonMistakes ?? [],
      tags: [],
      aliases: [],
      substitutions: [],
      variations: [],
    },
    ...overrides,
  };
}
