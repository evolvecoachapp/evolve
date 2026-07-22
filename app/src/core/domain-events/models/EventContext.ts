/**
 * Execution context in which a domain event occurred.
 */
export interface EventContext {
  readonly sessionId: string;
  readonly workoutRuntimeId: string | null;
  readonly restRuntimeId: string | null;
  readonly exerciseRuntimeId: string | null;
  readonly setRuntimeId: string | null;
  readonly athleteId: string | null;
  readonly dayId: string | null;
  readonly weekNumber: number | null;
}
