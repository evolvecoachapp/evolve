import type { AdaptationMetadata } from "./AdaptationMetadata";

export interface AdaptationCondition {
  readonly id: string;
  readonly key: string;
  readonly subjectId: string;
  readonly met: boolean;
  readonly signalKeys: readonly string[];
  readonly metadata: AdaptationMetadata;
}
