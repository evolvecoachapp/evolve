import type { AdaptationMetadata } from "./AdaptationMetadata";

export interface AdaptationSummary {
  readonly id: string;
  readonly athleteId: string;
  readonly contextId: string;
  readonly decisionCount: number;
  readonly opportunityCount: number;
  readonly triggerCount: number;
  readonly categoryKeys: readonly string[];
  readonly signalKeys: readonly string[];
  readonly metadata: AdaptationMetadata;
  readonly createdAt: string;
}
