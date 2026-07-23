/**
 * Immutable body-composition planning state.
 */
export interface BodyCompositionState {
  readonly phase: string;
  readonly estimatedBodyFatPercent: number | null;
  readonly notes: readonly string[];
}
