import type { EquipmentType } from "../../enums/EquipmentType";
import type { ExperienceLevel } from "../../enums/ExperienceLevel";
import type { SplitType } from "../../enums/SplitType";
import type { TrainingGoal } from "../../enums/TrainingGoal";
import type { ExerciseDefinition } from "../../models/ExerciseDefinition";
import type { ProgressionScheme } from "../../models/ProgressionScheme";
import type { TrainingProgram } from "../../models/TrainingProgram";
import type { TrainingSplit } from "../../models/TrainingSplit";
import type { ExerciseSelector } from "./ExerciseSelector";
import type { FrequencyPlanner } from "./FrequencyPlanner";
import type { ProgressionPlanner } from "./ProgressionPlanner";
import type { SplitPlanner } from "./SplitPlanner";
import type { VolumePlanner } from "./VolumePlanner";

/**
 * High-level, goal-agnostic request for a full training program. Expressed
 * in terms of outcomes (goal, experience, duration, availability) rather
 * than mechanics, so the same request shape covers bodybuilding,
 * powerlifting, powerbuilding, and hybrid athletes without a per-goal
 * request type.
 */
export interface ProgramGenerationRequest {
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
}

/**
 * The full set of planners a `ProgramGenerator` orchestrates. Injected
 * rather than hard-coded so any combination of planner implementations
 * (e.g. a powerlifting-tuned `VolumePlanner` paired with a hybrid-tuned
 * `SplitPlanner`) can be composed behind the same generator contract.
 */
export interface ProgramGeneratorPlanners {
  readonly frequencyPlanner: FrequencyPlanner;
  readonly splitPlanner: SplitPlanner;
  readonly exerciseSelector: ExerciseSelector;
  readonly volumePlanner: VolumePlanner;
  readonly progressionPlanner: ProgressionPlanner;
}

/**
 * Fully assembled output of a program generation pass, expressed entirely
 * in terms of existing domain models so it can be persisted or displayed
 * without further transformation.
 */
export interface GeneratedTrainingProgram {
  readonly program: TrainingProgram;
  readonly split: TrainingSplit;
  readonly progressionSchemes: readonly ProgressionScheme[];
}

/**
 * Orchestrates `FrequencyPlanner`, `SplitPlanner`, `ExerciseSelector`,
 * `VolumePlanner`, and `ProgressionPlanner` to turn a
 * `ProgramGenerationRequest` into a complete `GeneratedTrainingProgram`.
 * Contract only: this interface fixes how the planners are wired together
 * at the type level, but makes no assumption about the algorithm any
 * implementation uses to call them or combine their results.
 */
export interface ProgramGenerator {
  generateProgram(
    request: ProgramGenerationRequest,
    planners: ProgramGeneratorPlanners,
  ): GeneratedTrainingProgram;
}
