import type { TrainingAdaptationResult } from "../models/TrainingAdaptationResult";

/**
 * Temporary immutable cache of training adaptation results.
 * No persistence. No networking.
 */
export interface TrainingAdaptationRepository {
  save(result: TrainingAdaptationResult): Promise<TrainingAdaptationResult>;
  load(requestId: string): Promise<TrainingAdaptationResult | null>;
  list(): Promise<readonly TrainingAdaptationResult[]>;
  delete(requestId: string): Promise<boolean>;
  clear(): Promise<void>;
}
