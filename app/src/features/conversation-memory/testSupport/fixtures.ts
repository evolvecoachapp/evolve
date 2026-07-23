import { buildMemoryEntry } from "../builders/MemoryEntryBuilder";
import { buildMemoryQuery } from "../builders/MemoryQueryBuilder";
import { MemoryCategories } from "../models/MemoryCategory";
import type { MemoryEntry } from "../models/MemoryEntry";
import { MemoryPriorities } from "../models/MemoryPriority";
import type { MemoryQuery } from "../models/MemoryQuery";
import { MemoryQueryModes } from "../models/MemoryQuery";
import { MemoryScopes } from "../models/MemoryScope";
import type { MemoryUpdate } from "../models/MemoryUpdate";
import {
  createConversationMemoryService,
  type ConversationMemoryService,
} from "../services/ConversationMemoryService";

export const FIXED_TIMESTAMP = "2026-07-23T12:00:00.000Z";
export const FIXED_TIMESTAMP_LATER = "2026-07-23T13:00:00.000Z";

export function createFixedClock(ts = FIXED_TIMESTAMP): () => string {
  return () => ts;
}

export function createTestMemoryService(
  overrides: {
    readonly athleteId?: string | null;
    readonly conversationId?: string | null;
    readonly sessionId?: string | null;
    readonly maxEntries?: number;
    readonly clock?: () => string;
  } = {},
): ConversationMemoryService {
  return createConversationMemoryService({
    memoryId: "memory:test",
    athleteId: overrides.athleteId ?? "athlete-1",
    conversationId: overrides.conversationId ?? "conv-1",
    sessionId: overrides.sessionId ?? "session-1",
    maxEntries: overrides.maxEntries ?? 100,
    clock: overrides.clock ?? createFixedClock(),
  });
}

export function createProfileEntry(
  overrides: Partial<MemoryEntry> & { readonly id?: string } = {},
): MemoryEntry {
  return buildMemoryEntry({
    id: overrides.id ?? "mem:profile:1",
    category: MemoryCategories.PROFILE,
    key: overrides.key ?? "experience_level",
    value: overrides.value ?? "intermediate",
    createdAt: overrides.createdAt ?? FIXED_TIMESTAMP,
    updatedAt: overrides.updatedAt ?? FIXED_TIMESTAMP,
    scope: overrides.scope ?? MemoryScopes.ATHLETE,
    priority: overrides.priority ?? MemoryPriorities.HIGH,
    athleteId: overrides.athleteId ?? "athlete-1",
    conversationId: overrides.conversationId ?? "conv-1",
    sessionId: overrides.sessionId ?? "session-1",
    summary: overrides.summary ?? "Athlete experience",
  });
}

export function createContextEntry(
  overrides: Partial<MemoryEntry> & { readonly id?: string } = {},
): MemoryEntry {
  return buildMemoryEntry({
    id: overrides.id ?? "mem:context:1",
    category: MemoryCategories.CONTEXT,
    key: overrides.key ?? "current_focus",
    value: overrides.value ?? "hypertrophy",
    createdAt: overrides.createdAt ?? FIXED_TIMESTAMP,
    updatedAt: overrides.updatedAt ?? FIXED_TIMESTAMP,
    scope: overrides.scope ?? MemoryScopes.CONVERSATION,
    priority: overrides.priority ?? MemoryPriorities.NORMAL,
    athleteId: overrides.athleteId ?? "athlete-1",
    conversationId: overrides.conversationId ?? "conv-1",
    sessionId: overrides.sessionId ?? "session-1",
  });
}

export function createDecisionEntry(
  overrides: Partial<MemoryEntry> & { readonly id?: string } = {},
): MemoryEntry {
  return buildMemoryEntry({
    id: overrides.id ?? "mem:decision:1",
    category: MemoryCategories.DECISION,
    key: overrides.key ?? "last_plan",
    value: overrides.value ?? "accepted:3-day-split",
    createdAt: overrides.createdAt ?? FIXED_TIMESTAMP,
    updatedAt: overrides.updatedAt ?? FIXED_TIMESTAMP,
    scope: overrides.scope ?? MemoryScopes.CONVERSATION,
    priority: overrides.priority ?? MemoryPriorities.HIGH,
    athleteId: overrides.athleteId ?? "athlete-1",
    conversationId: overrides.conversationId ?? "conv-1",
    sessionId: overrides.sessionId ?? "session-1",
  });
}

export function createCategoryQuery(
  category = MemoryCategories.CONTEXT,
): MemoryQuery {
  return buildMemoryQuery({
    id: "query:category:1",
    createdAt: FIXED_TIMESTAMP,
    mode: MemoryQueryModes.BY_CATEGORY,
    category,
    conversationId: "conv-1",
  });
}

export function createMemoryUpdateFixture(
  entryId = "mem:context:1",
): MemoryUpdate {
  return Object.freeze({
    id: "update:1",
    entryId,
    value: "strength",
    summary: "Updated focus",
    priority: MemoryPriorities.HIGH,
    metadata: null,
    reason: "user_correction",
    createdAt: FIXED_TIMESTAMP_LATER,
  });
}
