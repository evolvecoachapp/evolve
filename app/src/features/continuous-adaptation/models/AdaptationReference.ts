import type { AdaptationMetadata } from "./AdaptationMetadata";

export interface AdaptationReference {
  readonly id: string;
  readonly adaptationId: string;
  readonly key: string;
  readonly kind: string;
  readonly metadata: AdaptationMetadata;
}
