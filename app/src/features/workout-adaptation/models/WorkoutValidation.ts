import type { WorkoutError } from "./WorkoutError";

export interface WorkoutValidation {
  readonly valid: boolean;
  readonly issues: readonly WorkoutError[];
}
