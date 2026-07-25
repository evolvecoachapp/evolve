import type { ExplanationMetadata } from "./ExplanationMetadata";

export interface ExplanationResolution {
  readonly id: string;
  readonly conflictId: string;
  readonly winnerId: string;
  readonly loserIds: readonly string[];
  readonly notes: readonly string[];
  readonly metadata: ExplanationMetadata;
}
