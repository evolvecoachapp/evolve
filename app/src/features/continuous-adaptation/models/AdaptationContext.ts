import type { AdaptationMetadata } from "./AdaptationMetadata";

export interface AdaptationContext {
  readonly id: string;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly contextId: string;
  readonly focusAreaKeys: readonly string[];
  readonly stateKeys: readonly string[];
  readonly decisionIds: readonly string[];
  readonly recommendationIds: readonly string[];
  readonly explanationIds: readonly string[];
  readonly metadata: AdaptationMetadata;
  readonly createdAt: string;
}
