import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface WorkoutSummary {
  readonly id: string;
  readonly athleteId: string;
  readonly blueprintId: string;
  readonly contextId: string;
  readonly adaptationId: string | null;
  readonly modificationCount: number;
  readonly adjustmentCount: number;
  readonly decisionKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
