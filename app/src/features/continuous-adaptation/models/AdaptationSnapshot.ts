import type { AdaptationDecision } from "./AdaptationDecision";
import type { AdaptationMetadata } from "./AdaptationMetadata";
import type { AdaptationSummary } from "./AdaptationSummary";

export interface AdaptationSnapshot {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisions: readonly AdaptationDecision[];
  readonly summary: AdaptationSummary | null;
  readonly signalKeys: readonly string[];
  readonly metadata: AdaptationMetadata;
  readonly createdAt: string;
}
