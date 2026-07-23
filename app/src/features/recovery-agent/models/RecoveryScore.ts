export type RecoveryScoreLabel = "poor" | "fair" | "good" | "excellent";

export interface RecoveryScore {
  readonly score: number;
  readonly label: RecoveryScoreLabel;
  readonly components: Readonly<Record<string, number>>;
}
