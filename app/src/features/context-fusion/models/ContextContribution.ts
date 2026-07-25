import type { ContextMetadata } from "./ContextMetadata";
import type { ContextSlice } from "./ContextSlice";
import type { ContextSourceKind } from "./ContextSource";
import type { ContextVersion } from "./ContextVersion";

/**
 * Immutable contribution payload from an upstream port.
 */
export interface ContextContribution {
  readonly id: string;
  readonly sourceKind: ContextSourceKind;
  readonly agentId: string | null;
  readonly athleteId: string;
  readonly sessionId: string | null;
  readonly conversationId: string | null;
  readonly slice: ContextSlice;
  readonly version: ContextVersion | null;
  readonly notes: readonly string[];
  readonly metadata: ContextMetadata;
  readonly contributedAt: string;
}
