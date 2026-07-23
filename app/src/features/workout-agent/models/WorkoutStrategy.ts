import type { WorkoutObjective } from "./WorkoutObjective";

/**
 * Selected training strategy descriptor (selection only — no execution).
 */
export interface WorkoutStrategy {
  readonly id: string;
  readonly name: string;
  readonly objective: WorkoutObjective;
  readonly priority: number;
  readonly tags: readonly string[];
  readonly description: string | null;
}
