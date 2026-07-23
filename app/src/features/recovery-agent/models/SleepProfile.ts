export type SleepLabel = "poor" | "fair" | "good" | "excellent";

export interface SleepProfile {
  readonly hours: number;
  readonly quality: number;
  readonly label: SleepLabel;
  readonly notes: readonly string[];
}
