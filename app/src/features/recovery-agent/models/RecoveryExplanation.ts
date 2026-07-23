export interface RecoveryExplanation {
  readonly id: string;
  readonly summary: string;
  readonly bullets: readonly string[];
  readonly strategyRationale: string | null;
  readonly policyNotes: readonly string[];
}
