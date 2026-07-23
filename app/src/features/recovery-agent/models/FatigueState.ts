export type FatigueLabel = "low" | "moderate" | "high" | "severe";

export interface FatigueState {
  readonly level: number;
  readonly label: FatigueLabel;
  readonly notes: readonly string[];
}
