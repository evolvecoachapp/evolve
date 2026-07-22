/**
 * Source attribution for a deterministic insight.
 */
export interface InsightEvidence {
  readonly sourceType: string;
  readonly sourceId: string;
  readonly attributes: Readonly<
    Record<string, string | number | boolean | null>
  >;
}
