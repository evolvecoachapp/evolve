import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface WorkoutReplacement {
  readonly id: string;
  readonly fromKey: string;
  readonly toKey: string;
  readonly sourceDecisionKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
