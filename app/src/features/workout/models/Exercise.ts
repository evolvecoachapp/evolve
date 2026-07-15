import type { ExerciseEquipment } from "./ExerciseEquipment";
import type { ExerciseMuscleGroup } from "./ExerciseMuscleGroup";
import type { ExerciseMetadata } from "./ExerciseMetadata";

/** Catalog exercise definition shared across workouts. */
export interface Exercise {
  id: string;
  name: string;
  muscleGroup: ExerciseMuscleGroup;
  equipment: ExerciseEquipment;
  instructions: string | null;
  videoUrl?: string | null;
  imageUrl?: string | null;
  /** Primary movers — defaults to `[muscleGroup]` when omitted. */
  primaryMuscles?: ExerciseMuscleGroup[];
  /** Supporting muscles recruited during the movement. */
  secondaryMuscles?: ExerciseMuscleGroup[];
  /** Coaching cues for form errors to watch for. */
  commonMistakes?: string[];
  /** Optional professional coaching metadata for premium exercise catalog experiences. */
  metadata?: ExerciseMetadata;
}
