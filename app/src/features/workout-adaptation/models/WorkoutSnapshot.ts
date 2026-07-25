import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface WorkoutSnapshot {
  readonly id: string;
  readonly athleteId: string;
  readonly blueprintId: string;
  readonly contextId: string;
  readonly adaptationId: string | null;
  readonly blueprintKeys: readonly string[];
  readonly dayKeys: readonly string[];
  readonly exerciseKeys: readonly string[];
  readonly sessionKeys: readonly string[];
  readonly weekKeys: readonly string[];
  readonly modificationIds: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
