import type { GoalProgress } from "./GoalProgress";
import type { GoalPackage } from "./GoalPackage";

export const GoalSessionStatuses = {
  IDLE: "idle",
  READY: "ready",
  ERROR: "error",
} as const;

export type GoalProgressSessionStatus =
  (typeof GoalSessionStatuses)[keyof typeof GoalSessionStatuses];

export interface GoalProgressState {
  readonly status: GoalProgressSessionStatus;
  readonly package: GoalPackage | null;
  readonly decisions: readonly GoalProgress[];
  readonly updatedAt: string;
}
