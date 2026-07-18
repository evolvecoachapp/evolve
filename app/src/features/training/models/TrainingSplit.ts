import type { SplitType } from "../enums/SplitType";
import type { TrainingSplitId } from "../types/ids";
import type { TrainingDay } from "./TrainingDay";

/**
 * A reusable microcycle template: the recurring pattern of training and
 * rest days (e.g. push/pull/legs, upper/lower) that a program schedules
 * over its duration. Independent of any specific program so the same
 * split definition can back multiple programs.
 */
export interface TrainingSplit {
  readonly id: TrainingSplitId;
  readonly name: string;
  readonly type: SplitType;
  readonly cycleLengthDays: number;
  readonly days: readonly TrainingDay[];
}
