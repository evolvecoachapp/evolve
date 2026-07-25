import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface WorkoutHistoryEntry {
  readonly id: string;
  readonly adaptationId: string;
  readonly blueprintId: string;
  readonly keys: readonly string[];
  readonly createdAt: string;
}

export interface WorkoutHistory {
  readonly id: string;
  readonly athleteId: string;
  readonly entries: readonly WorkoutHistoryEntry[];
  readonly historyKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
