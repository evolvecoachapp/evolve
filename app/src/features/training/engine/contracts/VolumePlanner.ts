import type { MuscleGroup } from "../../enums/MuscleGroup";
import type { SetPrescription } from "../../models/SetPrescription";
import type { ExerciseId } from "../../types/ids";
import type { PlanningContext } from "../context/PlanningContext";
import type { SelectedExercise } from "./ExerciseSelector";

/** Target weekly and per-session set volume for one muscle group. */
export interface MuscleGroupVolumeTarget {
  readonly muscleGroup: MuscleGroup;
  readonly weeklySets: number;
  readonly setsPerSession: number;
}

/**
 * Inputs a `VolumePlanner` needs to assign concrete set prescriptions to
 * already-selected exercises. Consumes the shared `PlanningContext` (goal
 * and experience, among others) instead of redeclaring those fields.
 * Volume is expressed per muscle group first, then distributed across the
 * exercises that target it, keeping the contract generic across
 * bodybuilding, powerlifting, powerbuilding, and hybrid volume
 * philosophies rather than baking in any one of them.
 */
export interface VolumePlanningInput {
  readonly planningContext: PlanningContext;
  readonly volumeTargets: readonly MuscleGroupVolumeTarget[];
  readonly selectedExercises: readonly SelectedExercise[];
}

/** Set prescriptions assigned to a single previously-selected exercise. */
export interface ExerciseVolumeAssignment {
  readonly exerciseId: ExerciseId;
  readonly setPrescriptions: readonly SetPrescription[];
}

/** Outcome of a volume planning pass for one training day. */
export interface VolumePlanningResult {
  readonly assignments: readonly ExerciseVolumeAssignment[];
}

/**
 * Translates muscle-group volume targets into concrete `SetPrescription`s
 * for each selected exercise. Contract only: no set, rep, or intensity math
 * lives here — this interface only fixes the shape of the inputs and
 * outputs so volume strategies can be swapped freely.
 */
export interface VolumePlanner {
  planVolume(input: VolumePlanningInput): VolumePlanningResult;
}
