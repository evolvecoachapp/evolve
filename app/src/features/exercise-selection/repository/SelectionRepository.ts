import type { ExerciseSelectionResult } from "../models/ExerciseSelectionResult";

/**
 * Ephemeral cache for intermediate selection results.
 * No persistence — in-memory only.
 */
export interface SelectionRepository {
  save(result: ExerciseSelectionResult): Promise<ExerciseSelectionResult>;
  load(requestId: string): Promise<ExerciseSelectionResult | null>;
  list(): Promise<readonly ExerciseSelectionResult[]>;
  delete(requestId: string): Promise<boolean>;
  clear(): Promise<void>;
}
