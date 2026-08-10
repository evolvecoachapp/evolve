export interface RecoveryDayRuntimeState {
  readonly sleepHours: number;
  readonly sleepQuality: number;
  readonly sleepLogged: boolean;
  readonly readinessScore: number;
  readonly assessedScore: number;
}

/**
 * Persisted in-session recovery runtime overlays keyed by ISO date (Sprint 35.4).
 */
export interface RecoveryRuntimePersistenceState {
  readonly athleteId: string;
  readonly days: Readonly<Record<string, RecoveryDayRuntimeState>>;
}

export function createRecoveryDayRuntimeState(
  input: RecoveryDayRuntimeState,
): RecoveryDayRuntimeState {
  return Object.freeze({ ...input });
}

export function createRecoveryRuntimePersistenceState(
  input: RecoveryRuntimePersistenceState,
): RecoveryRuntimePersistenceState {
  return Object.freeze({
    athleteId: input.athleteId,
    days: Object.freeze({ ...input.days }),
  });
}
