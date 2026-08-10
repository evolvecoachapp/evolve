/** Immutable metadata attached to every recovery progress event. */
export interface RecoveryProgressMetadata {
  readonly source: "recovery";
  readonly correlationId: string;
  readonly dayId: string;
  readonly assessmentId: string | null;
  readonly athleteId: string | null;
  readonly publishedAt: string;
}

export function createRecoveryProgressMetadata(
  input: RecoveryProgressMetadata,
): RecoveryProgressMetadata {
  return Object.freeze({ ...input });
}
