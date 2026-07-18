import type { Brand } from "./common";

/** Identifier for a catalogue entry in `ExerciseDefinition`. */
export type ExerciseId = Brand<string, "ExerciseId">;

/** Identifier for a `TrainingProgram`. */
export type TrainingProgramId = Brand<string, "TrainingProgramId">;

/** Identifier for a `TrainingSplit`. */
export type TrainingSplitId = Brand<string, "TrainingSplitId">;

/** Identifier for a `TrainingDay`. */
export type TrainingDayId = Brand<string, "TrainingDayId">;

/** Identifier for a `TrainingExercise` slot within a day. */
export type TrainingExerciseId = Brand<string, "TrainingExerciseId">;

/** Identifier for a `SetPrescription`. */
export type SetPrescriptionId = Brand<string, "SetPrescriptionId">;

/** Identifier for a `ProgressionScheme`. */
export type ProgressionSchemeId = Brand<string, "ProgressionSchemeId">;
