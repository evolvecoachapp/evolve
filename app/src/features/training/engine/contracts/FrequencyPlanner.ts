import type { MuscleGroup } from "../../enums/MuscleGroup";
import type { PlanningContext } from "../context/PlanningContext";

/** How often a single muscle group is trained within one microcycle. */
export interface MuscleGroupFrequency {
  readonly muscleGroup: MuscleGroup;
  readonly sessionsPerWeek: number;
}

/**
 * Inputs a `FrequencyPlanner` needs to decide how many sessions a
 * microcycle should contain and how often each muscle group is trained
 * within it. Consumes the shared `PlanningContext` (goal, experience, and
 * availability, among others) rather than redeclaring those fields, so the
 * same contract fits bodybuilding, powerlifting, powerbuilding, and hybrid
 * programming without depending on anything specific to a split.
 */
export interface FrequencyPlanningInput {
  readonly planningContext: PlanningContext;
  readonly targetMuscleGroups: readonly MuscleGroup[];
}

/** Outcome of a frequency planning pass for one microcycle. */
export interface FrequencyPlanningResult {
  readonly sessionsPerWeek: number;
  readonly microcycleLengthDays: number;
  readonly muscleGroupFrequencies: readonly MuscleGroupFrequency[];
}

/**
 * Decides training frequency: how many sessions a microcycle contains, and
 * how often each muscle group is trained within it. Contract only: the
 * resulting plan feeds `SplitPlanner` and `VolumePlanner`, but this
 * interface makes no assumption about how frequency is derived.
 */
export interface FrequencyPlanner {
  planFrequency(input: FrequencyPlanningInput): FrequencyPlanningResult;
}
