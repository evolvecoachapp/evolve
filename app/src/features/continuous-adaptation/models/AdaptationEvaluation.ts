import type { AdaptationMetadata } from "./AdaptationMetadata";
import type { AdaptationPriority } from "./AdaptationPriority";
import type { AdaptationSeverity } from "./AdaptationSeverity";

export interface AdaptationEvaluation {
  readonly id: string;
  readonly subjectId: string;
  readonly priority: AdaptationPriority;
  readonly severity: AdaptationSeverity;
  readonly riskOrdinal: number;
  readonly consistencyOrdinal: number;
  readonly dependencyCount: number;
  readonly signalKeys: readonly string[];
  readonly metadata: AdaptationMetadata;
}
