import type { AdaptationCategory } from "./AdaptationCategory";
import type { AdaptationMetadata } from "./AdaptationMetadata";
import type { AdaptationSeverity } from "./AdaptationSeverity";

export interface AdaptationOpportunity {
  readonly id: string;
  readonly category: AdaptationCategory;
  readonly subjectId: string;
  readonly candidateIds: readonly string[];
  readonly signalKeys: readonly string[];
  readonly severity: AdaptationSeverity;
  readonly metadata: AdaptationMetadata;
}
