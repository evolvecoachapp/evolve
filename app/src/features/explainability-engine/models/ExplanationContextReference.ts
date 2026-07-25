import type { ExplanationMetadata } from "./ExplanationMetadata";

export interface ExplanationContextReference {
  readonly id: string;
  readonly contextId: string;
  readonly athleteId: string;
  readonly focusAreaKeys: readonly string[];
  readonly metadata: ExplanationMetadata;
}
