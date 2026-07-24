/**
 * Immutable lifestyle state slice.
 */
export interface LifestyleState {
  readonly activityLevel: string | null;
  readonly occupationLoad: string | null;
  readonly notes: readonly string[];
}
