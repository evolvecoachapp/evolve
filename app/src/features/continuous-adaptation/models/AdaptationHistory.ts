import type { AdaptationMetadata } from "./AdaptationMetadata";

export interface AdaptationHistoryEntry {
  readonly id: string;
  readonly subjectId: string;
  readonly kind: string;
  readonly at: string;
  readonly signalKeys: readonly string[];
  readonly metadata: AdaptationMetadata;
}

export interface AdaptationHistory {
  readonly id: string;
  readonly athleteId: string;
  readonly entries: readonly AdaptationHistoryEntry[];
  readonly metadata: AdaptationMetadata;
  readonly createdAt: string;
}
