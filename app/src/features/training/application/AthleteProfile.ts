import type { EquipmentType } from "../enums/EquipmentType";
import type { ExperienceLevel } from "../enums/ExperienceLevel";
import type { SplitType } from "../enums/SplitType";
import type { TrainingGoal } from "../enums/TrainingGoal";
import type { ExerciseDefinition } from "../models/ExerciseDefinition";
import type { ExerciseId } from "../types/ids";

/**
 * Complete athlete snapshot required to generate a training program.
 *
 * This is an application-layer input: athlete facts plus an already-resolved
 * exercise catalogue. It carries no planning decisions — those remain inside
 * the Training Engine after `TrainingGenerationService` maps this profile to
 * a `ProgramGenerationRequest`.
 */
export interface AthleteProfile {
  readonly name: string;
  readonly description: string | null;
  readonly goal: TrainingGoal;
  readonly experienceLevel: ExperienceLevel;
  readonly durationWeeks: number;
  readonly availableDaysPerWeek: number;
  readonly availableEquipment: readonly EquipmentType[];
  readonly exerciseCatalogue: readonly ExerciseDefinition[];
  readonly preferredSplitType: SplitType | null;
  readonly tags: readonly string[];
  readonly excludedExerciseIds: readonly ExerciseId[];
}
