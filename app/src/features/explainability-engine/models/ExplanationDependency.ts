import type { ExplanationMetadata } from "./ExplanationMetadata";

export interface ExplanationDependency {
  readonly id: string;
  readonly fromId: string;
  readonly toId: string;
  readonly kind: string;
  readonly metadata: ExplanationMetadata;
}
