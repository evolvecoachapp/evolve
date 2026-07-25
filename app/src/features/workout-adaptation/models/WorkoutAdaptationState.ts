import type { WorkoutAdaptation } from "./WorkoutAdaptation";
import type { WorkoutPackage } from "./WorkoutPackage";

export const WorkoutSessionStatuses = {
  IDLE: "idle",
  READY: "ready",
  ERROR: "error",
} as const;

export type WorkoutSessionStatus =
  (typeof WorkoutSessionStatuses)[keyof typeof WorkoutSessionStatuses];

export interface WorkoutAdaptationState {
  readonly status: WorkoutSessionStatus;
  readonly package: WorkoutPackage | null;
  readonly adaptation: WorkoutAdaptation | null;
  readonly updatedAt: string;
}
