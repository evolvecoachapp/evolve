import type { ContextMetadata } from "./ContextMetadata";
import type { ContextSummary } from "./ContextSummary";
import type { ContextVersion } from "./ContextVersion";
import type { UnifiedCoachingContext } from "./UnifiedCoachingContext";

/**
 * Immutable point-in-time snapshot of fused context.
 */
export interface ContextSnapshot {
  readonly id: string;
  readonly contextId: string;
  readonly athleteId: string;
  readonly version: ContextVersion;
  readonly context: UnifiedCoachingContext;
  readonly summary: ContextSummary | null;
  readonly reason: string | null;
  readonly metadata: ContextMetadata;
  readonly createdAt: string;
}
