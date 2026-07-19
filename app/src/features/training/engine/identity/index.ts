/**
 * Public surface of the training Engine's identity module: the
 * `IdGenerator` contract plus its default, deterministic implementation.
 * This is the single place `TrainingProgram`, `TrainingSplit`,
 * `TrainingDay`, `TrainingExercise`, `ProgressionScheme`, and
 * `SetPrescription` ids are minted from, instead of each generator or
 * planner concatenating strings on its own.
 */
export type { IdGenerator } from "./IdGenerator";
export { DeterministicIdGenerator } from "./IdGenerator";
