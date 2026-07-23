export type ReadinessLabel = "poor" | "fair" | "good" | "excellent";

export interface ReadinessState {
  readonly score: number;
  readonly label: ReadinessLabel;
  readonly notes: readonly string[];
}
