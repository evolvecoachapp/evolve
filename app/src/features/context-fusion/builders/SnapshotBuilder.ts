import type { ContextSnapshot } from "../models/ContextSnapshot";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";
import { EMPTY_CONTEXT_METADATA } from "../models/ContextMetadata";
import { buildContextSummary } from "./SummaryBuilder";
import { freezeSnapshot } from "../utils/FreezeContext";

export function buildContextSnapshot(input: {
  readonly id: string;
  readonly context: UnifiedCoachingContext;
  readonly reason?: string | null;
  readonly createdAt: string;
}): ContextSnapshot {
  return freezeSnapshot({
    id: input.id,
    contextId: input.context.id,
    athleteId: input.context.athleteId,
    version: input.context.version,
    context: input.context,
    summary: buildContextSummary({
      context: input.context,
      createdAt: input.createdAt,
    }),
    reason: input.reason ?? null,
    metadata: EMPTY_CONTEXT_METADATA,
    createdAt: input.createdAt,
  });
}
