import type { RecoveryMetadata } from "./RecoveryMetadata";

export interface RecoveryTimelineItem {
  readonly id: string;
  readonly adaptationId: string;
  readonly keys: readonly string[];
  readonly createdAt: string;
}

export interface RecoveryTimeline {
  readonly id: string;
  readonly athleteId: string;
  readonly items: readonly RecoveryTimelineItem[];
  readonly metadata: RecoveryMetadata;
  readonly createdAt: string;
}
