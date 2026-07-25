import type { AdaptationCategory } from "./AdaptationCategory";
import type { AdaptationMetadata } from "./AdaptationMetadata";
import type { AdaptationPriority } from "./AdaptationPriority";

export interface AdaptationCandidate {
  readonly id: string;
  readonly category: AdaptationCategory;
  readonly subjectId: string;
  readonly triggerIds: readonly string[];
  readonly signalKeys: readonly string[];
  readonly priority: AdaptationPriority;
  readonly metadata: AdaptationMetadata;
}
