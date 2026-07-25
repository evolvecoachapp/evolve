import { EMPTY_CONTEXT_INTEGRITY } from "../models/ContextIntegrity";
import { EMPTY_CONTEXT_METADATA } from "../models/ContextMetadata";
import { DEFAULT_CONTEXT_PRIORITIES } from "../models/ContextPriority";
import {
  INITIAL_CONTEXT_VERSION,
} from "../models/ContextVersion";
import type { ContextDescriptor } from "../models/ContextDescriptor";
import type { UnifiedCoachingContext } from "../models/UnifiedCoachingContext";
import { ContextSourceKinds } from "../models/ContextSource";
import { freezeContext, freezeDescriptor } from "../utils/FreezeContext";

export function buildEmptyUnifiedContext(input: {
  readonly id: string;
  readonly athleteId: string;
  readonly sessionId?: string | null;
  readonly conversationId?: string | null;
  readonly at: string;
}): UnifiedCoachingContext {
  return freezeContext({
    id: input.id,
    athleteId: input.athleteId,
    sessionId: input.sessionId ?? null,
    conversationId: input.conversationId ?? null,
    version: INITIAL_CONTEXT_VERSION,
    sources: Object.freeze([]),
    sections: Object.freeze([]),
    views: Object.freeze([]),
    dependencies: Object.freeze([]),
    priorities: DEFAULT_CONTEXT_PRIORITIES,
    conflicts: Object.freeze([]),
    resolutions: Object.freeze([]),
    merge: null,
    integrity: EMPTY_CONTEXT_INTEGRITY,
    confidence: Object.freeze({
      level: "unknown",
      sourceCount: 0,
      resolvedConflictCount: 0,
      notes: Object.freeze([] as string[]),
    }),
    timeline: Object.freeze({
      items: Object.freeze([]),
      metadata: EMPTY_CONTEXT_METADATA,
    }),
    statistics: Object.freeze({
      sourceCount: 0,
      sectionCount: 0,
      dependencyCount: 0,
      conflictCount: 0,
      resolutionCount: 0,
      timelineItemCount: 0,
    }),
    diagnostics: Object.freeze({
      warnings: Object.freeze([] as string[]),
      notes: Object.freeze([] as string[]),
      missingSources: Object.freeze([] as string[]),
    }),
    summary: null,
    conversation: null,
    session: null,
    athlete: null,
    workout: null,
    nutrition: null,
    recovery: null,
    goal: null,
    supervisor: null,
    metadata: EMPTY_CONTEXT_METADATA,
    createdAt: input.at,
    updatedAt: input.at,
  });
}

export function buildContextDescriptor(input: {
  readonly id: string;
  readonly createdAt: string;
}): ContextDescriptor {
  return freezeDescriptor({
    id: input.id,
    name: "Context Fusion Engine",
    version: "0.1.0",
    capabilities: Object.freeze([
      "buildUnifiedContext",
      "mergeContexts",
      "validateUnifiedContext",
      "describeContext",
      "createContextSnapshot",
    ]),
    sourceKinds: Object.freeze(Object.values(ContextSourceKinds)),
    metadata: EMPTY_CONTEXT_METADATA,
    createdAt: input.createdAt,
  });
}
