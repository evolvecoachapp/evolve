export interface ExplanationStatistics {
  readonly totalExplanations: number;
  readonly byCategory: Readonly<Record<string, number>>;
  readonly byReasonCode: Readonly<Record<string, number>>;
  readonly evidenceCount: number;
}
