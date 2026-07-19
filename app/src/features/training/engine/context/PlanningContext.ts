import type { EquipmentType } from "../../enums/EquipmentType";
import type { ExperienceLevel } from "../../enums/ExperienceLevel";
import type { SplitType } from "../../enums/SplitType";
import type { TrainingGoal } from "../../enums/TrainingGoal";
import type { ExerciseLookup } from "./ExerciseLookup";

/**
 * Canonical, immutable snapshot of the planning information shared across
 * every planner in the engine pipeline. `goal`, `experienceLevel`,
 * `availableEquipment`, and `durationWeeks` were previously redeclared,
 * verbatim, on `FrequencyPlanningInput`, `SplitPlanningInput`,
 * `VolumePlanningInput`, `ProgressionPlanningInput`, and
 * `ProgramGenerationRequest` — five separate contracts all describing the
 * same handful of athlete- and program-level facts. `PlanningContext`
 * collects exactly that overlap into a single value so each planner
 * contract only has to declare the inputs that are actually unique to it
 * (e.g. `targetMuscleGroups`, `frequencyPlan`, `selectedExercises`).
 *
 * `ProgramGenerator` (see `RuleBasedProgramGenerator`) constructs one
 * `PlanningContext` per `generateProgram` call, derived from the
 * `ProgramGenerationRequest` it was given, and threads that same instance
 * through every planner it orchestrates. No planner ever constructs its
 * own `PlanningContext` or derives one from another planner's output —
 * that would reintroduce the duplication this type exists to remove.
 *
 * Deliberately holds only *shared* planning inputs, not planner-specific
 * ones: `preferredSplitType`, for instance, is only ever read by
 * `SplitPlanner`, but it still lives here rather than on
 * `SplitPlanningInput` alone because it is set once, at the program level,
 * exactly like every other field below — the same "decided once, consulted
 * everywhere" shape that motivates including it. Contains no algorithmic
 * defaults, derived values, or planner decisions of its own: it is a pure
 * data holder, so introducing it changes no planning behavior.
 *
 * `exerciseLookup` follows the same "decided once, consulted everywhere"
 * rationale: `RuleBasedProgramGenerator`, `RuleBasedVolumePlanner`, and
 * `RuleBasedProgressionPlanner` previously each built their own
 * `ExerciseId` -> `ExerciseDefinition` map from the same
 * `exerciseCatalogue`, three independent copies that could silently drift
 * apart. It is built exactly once, by `RuleBasedProgramGenerator`, and
 * every planner reads the same instance from here instead of owning one.
 */
export interface PlanningContext {
  /** Primary training objective the entire program is built around. */
  readonly goal: TrainingGoal;
  /** Athlete experience level the entire program is designed for. */
  readonly experienceLevel: ExperienceLevel;
  /** Total planned duration of the program, in weeks. */
  readonly durationWeeks: number;
  /** How many days per week the athlete has available to train. */
  readonly availableDaysPerWeek: number;
  /** Equipment the athlete has access to for the entire program. */
  readonly availableEquipment: readonly EquipmentType[];
  /** Split shape explicitly requested by the caller, or `null` to let `SplitPlanner` decide one. */
  readonly preferredSplitType: SplitType | null;
  /** Single canonical exercise catalogue lookup shared by every planner in this pass. */
  readonly exerciseLookup: ExerciseLookup;
}
