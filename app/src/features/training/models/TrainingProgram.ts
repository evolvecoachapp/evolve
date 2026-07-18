import type { ExperienceLevel } from "../enums/ExperienceLevel";
import type { TrainingGoal } from "../enums/TrainingGoal";
import type { ProgressionSchemeId, TrainingProgramId, TrainingSplitId } from "../types/ids";

/**
 * The top-level container describing a full training program: its
 * objective, target athlete, duration, and the split/default progression
 * it is built on. References the split and progression by id rather than
 * embedding them, keeping program structure decoupled from their contents
 * and avoiding circular dependencies between models.
 */
export interface TrainingProgram {
  readonly id: TrainingProgramId;
  readonly name: string;
  readonly description: string | null;
  readonly goal: TrainingGoal;
  readonly experienceLevel: ExperienceLevel;
  readonly durationWeeks: number;
  readonly splitId: TrainingSplitId;
  readonly defaultProgressionSchemeId: ProgressionSchemeId | null;
  readonly tags: readonly string[];
}
