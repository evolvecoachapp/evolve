import type { CoachingExplanation } from "./CoachingExplanation";
import type { ExplanationMetadata } from "./ExplanationMetadata";
import type { ExplanationSummary } from "./ExplanationSummary";

export interface ExplanationSnapshot {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly explanations: readonly CoachingExplanation[];
  readonly summary: ExplanationSummary | null;
  readonly metadata: ExplanationMetadata;
  readonly createdAt: string;
}
