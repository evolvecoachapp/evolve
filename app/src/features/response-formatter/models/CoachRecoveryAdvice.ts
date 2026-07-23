/**
 * Immutable recovery advice parsed from provider output.
 */
export interface CoachRecoveryAdvice {
  readonly id: string;
  readonly text: string;
  readonly focus: string | null;
}
