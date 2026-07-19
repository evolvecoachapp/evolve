/**
 * Public surface of the training Programming Engine: contracts only.
 * These interfaces define the strongly typed inputs and outputs of each
 * planner (exercise selection, volume, frequency, split, and progression)
 * plus the `ProgramGenerator` that orchestrates them, all expressed in
 * terms of the existing `training` domain models. No implementations,
 * business logic, mock data, or algorithms live here.
 */
export type { PlanningContext } from "./context/PlanningContext";
export type {
  ExerciseSelectionCriteria,
  ExerciseSelectionResult,
  ExerciseSelector,
  SelectedExercise,
} from "./contracts/ExerciseSelector";
export type {
  FrequencyPlanner,
  FrequencyPlanningInput,
  FrequencyPlanningResult,
  MuscleGroupFrequency,
} from "./contracts/FrequencyPlanner";
export type {
  GeneratedTrainingProgram,
  ProgramGenerationRequest,
  ProgramGenerator,
  ProgramGeneratorPlanners,
} from "./contracts/ProgramGenerator";
export type {
  ProgressionPlanner,
  ProgressionPlanningInput,
  ProgressionPlanningResult,
} from "./contracts/ProgressionPlanner";
export type {
  SplitPlanner,
  SplitPlanningInput,
  SplitPlanningResult,
  TrainingDayBlueprint,
} from "./contracts/SplitPlanner";
export type {
  ExerciseVolumeAssignment,
  MuscleGroupVolumeTarget,
  VolumePlanner,
  VolumePlanningInput,
  VolumePlanningResult,
} from "./contracts/VolumePlanner";
