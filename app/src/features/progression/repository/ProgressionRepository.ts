import type { ProgressionPlan } from "../models/ProgressionPlan";

/**
 * Temporary immutable cache of progression plans.
 * No persistence. No networking.
 */
export interface ProgressionRepository {
  save(plan: ProgressionPlan): Promise<ProgressionPlan>;
  load(requestId: string): Promise<ProgressionPlan | null>;
  list(): Promise<readonly ProgressionPlan[]>;
  delete(requestId: string): Promise<boolean>;
  clear(): Promise<void>;
}
