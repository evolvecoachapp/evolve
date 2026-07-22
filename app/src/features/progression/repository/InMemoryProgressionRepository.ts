import type { ProgressionPlan } from "../models/ProgressionPlan";
import { freezeProgressionPlan } from "../utils/freezeProgressionPlan";
import type { ProgressionRepository } from "./ProgressionRepository";

/**
 * In-memory cache of progression plans for the current process.
 * Temporary immutable cache only — no persistence.
 */
export class InMemoryProgressionRepository implements ProgressionRepository {
  private readonly store = new Map<string, ProgressionPlan>();

  async save(plan: ProgressionPlan): Promise<ProgressionPlan> {
    const frozen = freezeProgressionPlan(plan);
    this.store.set(frozen.requestId, frozen);
    return frozen;
  }

  async load(requestId: string): Promise<ProgressionPlan | null> {
    return this.store.get(requestId) ?? null;
  }

  async list(): Promise<readonly ProgressionPlan[]> {
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

export const progressionRepository = new InMemoryProgressionRepository();
