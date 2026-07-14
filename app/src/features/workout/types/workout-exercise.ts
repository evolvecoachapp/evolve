import type {
  Equipment,
  ExerciseType,
  MovementPattern,
  MuscleGroup,
} from "./common";
import type { ExerciseSet } from "./exercise-set";

/**
 * An exercise prescription within a workout day, split into warmup and working sets.
 * Legacy fields (`muscleGroup`, `equipment`, `notes`) remain required for compatibility;
 * enriched metadata is optional and can be populated incrementally.
 */

export interface WorkoutExercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  equipment: Equipment;
  notes: string | null;
  warmupSets: ExerciseSet[];
  workingSets: ExerciseSet[];
  exerciseType?: ExerciseType;
  movementPattern?: MovementPattern;
  unilateral?: boolean;
  primaryMuscles?: MuscleGroup[];
  secondaryMuscles?: MuscleGroup[];
  equipmentRequired?: Equipment[];
  estimatedDurationSeconds?: number;
  videoUrl?: string | null;
  thumbnail?: string | null;
  coachNotes?: string | null;
}
