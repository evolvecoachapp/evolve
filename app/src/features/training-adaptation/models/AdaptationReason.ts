/**
 * Machine-readable reason an assessment or adaptation strategy fired.
 */
export interface AdaptationReason {
  readonly code: string;
  readonly weight: number;
  readonly detail?: string;
}
