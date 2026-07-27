/**
 * Immutable decision summary composed from existing Decision Engine / Timeline refs.
 */
export interface CoachingSessionDecision {
  readonly decisionIds: readonly string[];
  readonly titles: readonly string[];
  readonly summary: string;
  readonly present: boolean;
}
