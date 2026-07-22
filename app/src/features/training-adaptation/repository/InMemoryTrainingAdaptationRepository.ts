import type { TrainingAdaptationResult } from "../models/TrainingAdaptationResult";
import { freezeTrainingAdaptationResult } from "../utils/freezeTrainingAdaptationResult";
import type { TrainingAdaptationRepository } from "./TrainingAdaptationRepository";

/**
 * In-memory cache of training adaptation results for the current process.
 * Temporary immutable cache only — no persistence.
 */
export class InMemoryTrainingAdaptationRepository
  implements TrainingAdaptationRepository
{
  private readonly store = new Map<string, TrainingAdaptationResult>();

  async save(
    result: TrainingAdaptationResult,
  ): Promise<TrainingAdaptationResult> {
    const frozen = freezeTrainingAdaptationResult(result);
    this.store.set(frozen.requestId, frozen);
    return frozen;
  }

  async load(requestId: string): Promise<TrainingAdaptationResult | null> {
    return this.store.get(requestId) ?? null;
  }

  async list(): Promise<readonly TrainingAdaptationResult[]> {
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

export const trainingAdaptationRepository =
  new InMemoryTrainingAdaptationRepository();
