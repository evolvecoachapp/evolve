export type DeloadIntensity = "none" | "light" | "moderate" | "full";

export interface DeloadRecommendation {
  readonly recommended: boolean;
  readonly intensity: DeloadIntensity;
  readonly rationale: string;
  readonly durationDays: number;
}
