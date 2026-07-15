export type ExerciseAlias = string;

export interface ExerciseSubstitution {
  id: string; // exercise id to substitute
  reason?: string;
}

export interface ExerciseVariation {
  id: string;
  note?: string;
}

export interface ExerciseKnowledge {
  aliases?: ExerciseAlias[];
  substitutions?: ExerciseSubstitution[];
  variations?: ExerciseVariation[];
  movementPattern?: string;
  equipment?: string[];
  bodyRegion?: string;
  primaryMuscles?: string[];
  secondaryMuscles?: string[];
  stabilizers?: string[];
  tempo?: string;
  recommendedRestSeconds?: number;
  coachTip?: string;
  executionSteps?: string[];
  breathing?: string;
  rangeOfMotion?: string;
  safetyNotes?: string[];
  commonMistakes?: string[];
  tags?: string[];
}

export function createDefaultExerciseKnowledge(overrides: Partial<ExerciseKnowledge> = {}): ExerciseKnowledge {
  return {
    aliases: [],
    substitutions: [],
    variations: [],
    movementPattern: undefined,
    equipment: [],
    bodyRegion: undefined,
    primaryMuscles: [],
    secondaryMuscles: [],
    stabilizers: [],
    tempo: "2-0-2",
    recommendedRestSeconds: 60,
    coachTip: "",
    executionSteps: [],
    breathing: "",
    rangeOfMotion: "",
    safetyNotes: [],
    commonMistakes: [],
    tags: [],
    ...overrides,
  };
}
