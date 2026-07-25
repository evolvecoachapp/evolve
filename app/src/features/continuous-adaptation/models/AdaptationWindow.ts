import type { AdaptationMetadata } from "./AdaptationMetadata";

export interface AdaptationWindow {
  readonly id: string;
  readonly startAt: string;
  readonly endAt: string;
  readonly itemIds: readonly string[];
  readonly metadata: AdaptationMetadata;
}
