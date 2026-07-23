import type { RecoveryGoal } from "./RecoveryGoal";

export interface RecoveryStrategy {
  readonly id: string;
  readonly name: string;
  readonly goal: RecoveryGoal;
  readonly priority: number;
  readonly tags: readonly string[];
  readonly description: string;
}
