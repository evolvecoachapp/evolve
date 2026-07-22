/**
 * Evidence attributes supporting a recovery assessment.
 */
export interface RecoveryEvidence {
  readonly sourceType: string;
  readonly sourceId: string;
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
}
