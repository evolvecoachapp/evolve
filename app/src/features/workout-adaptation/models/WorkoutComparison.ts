import type { WorkoutMetadata } from "./WorkoutMetadata";

export interface WorkoutComparison {
  readonly id: string;
  readonly athleteId: string;
  readonly blueprintId: string;
  readonly beforeKeys: readonly string[];
  readonly afterKeys: readonly string[];
  readonly addedKeys: readonly string[];
  readonly removedKeys: readonly string[];
  readonly sharedKeys: readonly string[];
  readonly metadata: WorkoutMetadata;
  readonly createdAt: string;
}
