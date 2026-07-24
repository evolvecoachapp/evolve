/**
 * Immutable nutrition state slice.
 */
export interface NutritionState {
  readonly planId: string | null;
  readonly dietaryPattern: string | null;
  readonly lastLoggedAt: string | null;
  readonly targetsPresent: boolean;
  readonly notes: readonly string[];
  readonly sourceAgentIds: readonly string[];
}
