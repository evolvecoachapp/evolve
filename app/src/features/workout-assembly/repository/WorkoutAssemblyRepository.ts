import type { WorkoutAssemblyResult } from "../models/WorkoutAssemblyResult";

/**
 * Temporary immutable cache of workout assembly results.
 * No persistence. No networking.
 */
export interface WorkoutAssemblyRepository {
  save(result: WorkoutAssemblyResult): Promise<WorkoutAssemblyResult>;
  load(requestId: string): Promise<WorkoutAssemblyResult | null>;
  list(): Promise<readonly WorkoutAssemblyResult[]>;
  delete(requestId: string): Promise<boolean>;
  clear(): Promise<void>;
}
