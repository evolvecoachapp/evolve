import type { ExplanationPackage } from "./ExplanationPackage";
import type { CoachingExplanation } from "./CoachingExplanation";

export const ExplanationSessionStatuses = {
  IDLE: "idle",
  READY: "ready",
  ERROR: "error",
} as const;

export type ExplanationSessionStatus =
  (typeof ExplanationSessionStatuses)[keyof typeof ExplanationSessionStatuses];

export interface ExplanationState {
  readonly status: ExplanationSessionStatus;
  readonly package: ExplanationPackage | null;
  readonly explanations: readonly CoachingExplanation[];
  readonly updatedAt: string;
}
