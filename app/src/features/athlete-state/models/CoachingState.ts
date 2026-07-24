/**
 * Immutable coaching context slice for supervisor consumption.
 */
export interface CoachingState {
  readonly activeSessionId: string | null;
  readonly lastSessionId: string | null;
  readonly lastIntent: string | null;
  readonly focusAreas: readonly string[];
  readonly notes: readonly string[];
  readonly sourceSessionIds: readonly string[];
}
