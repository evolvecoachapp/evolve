import type { ExerciseSelectionResult } from "../models/ExerciseSelectionResult";
import { freezeSelectionResult } from "../utils/freezeSelectionResult";
import type { SelectionRepository } from "./SelectionRepository";

/**
 * In-memory cache of selection results for the current process.
 */
export class InMemorySelectionRepository implements SelectionRepository {
  private readonly store = new Map<string, ExerciseSelectionResult>();

  async save(result: ExerciseSelectionResult): Promise<ExerciseSelectionResult> {
    const frozen = freezeSelectionResult(result);
    this.store.set(frozen.requestId, frozen);
    return frozen;
  }

  async load(requestId: string): Promise<ExerciseSelectionResult | null> {
    return this.store.get(requestId) ?? null;
  }

  async list(): Promise<readonly ExerciseSelectionResult[]> {
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

export const selectionRepository = new InMemorySelectionRepository();
