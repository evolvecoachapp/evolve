import type { ExerciseEquipment } from "./ExerciseEquipment";
import type { ExerciseMuscleGroup } from "./ExerciseMuscleGroup";

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
    ...overrides,
  };
}
