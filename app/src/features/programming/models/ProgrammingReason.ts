/**
 * Machine-readable reason a programming strategy applied a prescription change.
 */
export interface ProgrammingReason {
  readonly code: string;
  readonly weight: number;
  readonly detail?: string;
}
