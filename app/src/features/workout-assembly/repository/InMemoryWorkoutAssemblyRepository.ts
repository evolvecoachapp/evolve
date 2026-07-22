import type { WorkoutAssemblyResult } from "../models/WorkoutAssemblyResult";
import { freezeWorkoutAssemblyResult } from "../utils/freezeWorkoutSession";
import type { WorkoutAssemblyRepository } from "./WorkoutAssemblyRepository";

/**
 * In-memory cache of workout assembly results for the current process.
 * Temporary immutable cache only — no persistence.
 */
export class InMemoryWorkoutAssemblyRepository
  implements WorkoutAssemblyRepository
{
  private readonly store = new Map<string, WorkoutAssemblyResult>();

  async save(result: WorkoutAssemblyResult): Promise<WorkoutAssemblyResult> {
    const frozen = freezeWorkoutAssemblyResult(result);
    this.store.set(frozen.requestId, frozen);
    return frozen;
  }

  async load(requestId: string): Promise<WorkoutAssemblyResult | null> {
    return this.store.get(requestId) ?? null;
  }

  async list(): Promise<readonly WorkoutAssemblyResult[]> {
    return Object.freeze(
      [...this.store.values()].sort((left, right) =>
        left.requestId.localeCompare(right.requestId),
      ),
    );
  }

  async delete(requestId: string): Promise<boolean> {
    return this.store.delete(requestId);
  }

  async clear(): Promise<void> {
    this.store.clear();
  }
}

export const workoutAssemblyRepository = new InMemoryWorkoutAssemblyRepository();
