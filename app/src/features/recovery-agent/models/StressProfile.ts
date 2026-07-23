export type StressLabel = "low" | "moderate" | "high" | "severe";

export interface StressProfile {
  readonly level: number;
  readonly label: StressLabel;
  readonly notes: readonly string[];
}
