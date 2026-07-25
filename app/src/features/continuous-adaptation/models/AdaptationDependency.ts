import type { AdaptationMetadata } from "./AdaptationMetadata";

export interface AdaptationDependency {
  readonly id: string;
  readonly fromId: string;
  readonly toId: string;
  readonly kind: string;
  readonly metadata: AdaptationMetadata;
}
