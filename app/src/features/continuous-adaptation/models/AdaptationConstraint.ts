import type { AdaptationMetadata } from "./AdaptationMetadata";

export interface AdaptationConstraint {
  readonly id: string;
  readonly key: string;
  readonly subjectId: string;
  readonly subjectKeys: readonly string[];
  readonly metadata: AdaptationMetadata;
}
