/**
 * Machine-readable reason a progression strategy applied a timeline change.
 */
export interface ProgressionReason {
  readonly code: string;
  readonly weight: number;
  readonly detail?: string;
}
