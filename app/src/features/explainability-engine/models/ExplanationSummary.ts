import type { ExplanationMetadata } from "./ExplanationMetadata";

export interface ExplanationSummary {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly explanationCount: number;
  readonly reasonCodeKeys: readonly string[];
  readonly evidenceKeyCount: number;
  readonly focusAreaKeys: readonly string[];
  readonly metadata: ExplanationMetadata;
  readonly createdAt: string;
}
