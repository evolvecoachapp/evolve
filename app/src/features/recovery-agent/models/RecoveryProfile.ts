export interface RecoveryProfile {
  readonly athleteId: string | null;
  readonly baselineRecoveryScore: number;
  readonly preferredProtocol: string | null;
  readonly notes: readonly string[];
}
