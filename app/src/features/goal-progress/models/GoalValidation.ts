import type { GoalError } from "./GoalError";

export interface GoalValidation {
  readonly valid: boolean;
  readonly issues: readonly GoalError[];
}
