import type { ExerciseEquipment } from "./ExerciseEquipment";
import type { ExerciseMuscleGroup } from "./ExerciseMuscleGroup";

/** Catalog exercise definition shared across workouts. */
export interface Exercise {
  id: string;
  name: string;
  muscleGroup: ExerciseMuscleGroup;
  equipment: ExerciseEquipment;
  instructions: string | null;
  videoUrl?: string | null;
  imageUrl?: string | null;
}
