import type { RecoveryProgressEventType } from "../events";

/** Immutable publisher snapshot — represent only. */
export interface RecoveryProgressSnapshot {
  readonly publishedEventCount: number;
  readonly lastEventId: string | null;
  readonly lastEventType: RecoveryProgressEventType | null;
  readonly capturedAt: string;
}

export function createRecoveryProgressSnapshot(
  input: RecoveryProgressSnapshot,
): RecoveryProgressSnapshot {
  return Object.freeze({ ...input });
}
