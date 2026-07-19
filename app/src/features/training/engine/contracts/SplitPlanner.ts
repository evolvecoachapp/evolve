import type { MuscleGroup } from "../../enums/MuscleGroup";
import type { SplitType } from "../../enums/SplitType";
import type { PlanningContext } from "../context/PlanningContext";
import type { FrequencyPlanningResult } from "./FrequencyPlanner";

/**
 * Blueprint for a single day within a planned split, produced before any
 * exercises are selected. Mirrors `TrainingDay` minus its exercise list,
 * since exercise selection and volume planning happen in later stages of
 * the engine pipeline and should not be decided by the `SplitPlanner`.
 */
export interface TrainingDayBlueprint {
  readonly dayIndex: number;
  readonly name: string;
  readonly isRestDay: boolean;
  readonly primaryFocus: readonly MuscleGroup[];
}

/**
 * Inputs a `SplitPlanner` needs to lay out a microcycle's day structure.
 * Consumes the shared `PlanningContext` (goal, experience, and the
 * caller's `preferredSplitType`, among others) instead of redeclaring
 * those fields, plus a `FrequencyPlanningResult` so the resulting
 * structure always reflects an already-decided training frequency instead
 * of re-deriving one — keeping frequency and split-shape decisions
 * independent.
 */
export interface SplitPlanningInput {
  readonly planningContext: PlanningContext;
  readonly frequencyPlan: FrequencyPlanningResult;
}

/** Outcome of a split planning pass: a full microcycle day-by-day layout. */
export interface SplitPlanningResult {
  readonly splitType: SplitType;
  readonly cycleLengthDays: number;
  readonly days: readonly TrainingDayBlueprint[];
}

/**
 * Lays out the recurring day structure — training vs. rest days, and each
 * day's primary muscle focus — that exercise selection and volume planning
 * will later fill in. Contract only: no split-design logic lives here, so
 * bodybuilding, powerlifting, powerbuilding, and hybrid split philosophies
 * can all be implemented behind this same interface.
 */
export interface SplitPlanner {
  planSplit(input: SplitPlanningInput): SplitPlanningResult;
}
