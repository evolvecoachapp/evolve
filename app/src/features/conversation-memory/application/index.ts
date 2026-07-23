import type { MemoryEntry } from "../models/MemoryEntry";
import type { MemoryQuery } from "../models/MemoryQuery";
import type { MemoryResult } from "../models/MemoryResult";
import type { MemoryUpdate } from "../models/MemoryUpdate";
import {
  createConversationMemoryService,
  type ConversationMemoryService,
  type ConversationMemoryServiceDeps,
} from "../services/ConversationMemoryService";

function resolveService(
  service?: ConversationMemoryService,
  deps?: ConversationMemoryServiceDeps,
): ConversationMemoryService {
  return service ?? createConversationMemoryService(deps);
}

/**
 * Public API — save structured coaching memory.
 */
export function saveMemory(options: {
  readonly entry: MemoryEntry;
  readonly service?: ConversationMemoryService;
  readonly clock?: ConversationMemoryServiceDeps["clock"];
  readonly athleteId?: ConversationMemoryServiceDeps["athleteId"];
  readonly conversationId?: ConversationMemoryServiceDeps["conversationId"];
  readonly sessionId?: ConversationMemoryServiceDeps["sessionId"];
}): MemoryResult {
  const { service, entry, ...deps } = options;
  return resolveService(
    service,
    deps.clock || deps.athleteId || deps.conversationId || deps.sessionId
      ? deps
      : undefined,
  ).saveMemory(entry);
}

/**
 * Public API — load a memory entry by id.
 */
export function loadMemory(options: {
  readonly entryId: string;
  readonly service?: ConversationMemoryService;
}): MemoryResult {
  return resolveService(options.service).loadMemory(options.entryId);
}

/**
 * Public API — query memory deterministically.
 */
export function queryMemory(options: {
  readonly query: MemoryQuery;
  readonly service?: ConversationMemoryService;
}): MemoryResult {
  return resolveService(options.service).queryMemory(options.query);
}

/**
 * Public API — update an existing memory entry.
 */
export function updateMemory(options: {
  readonly update: MemoryUpdate;
  readonly service?: ConversationMemoryService;
}): MemoryResult {
  return resolveService(options.service).updateMemory(options.update);
}

/**
 * Public API — build an immutable memory snapshot.
 */
export function buildMemorySnapshot(options: {
  readonly service?: ConversationMemoryService;
  readonly snapshotId?: string;
  readonly turnCount?: number;
} = {}): MemoryResult {
  const { service, ...rest } = options;
  return resolveService(service).buildMemorySnapshot(rest);
}

/**
 * Public API — summarize current working memory.
 */
export function summarizeMemory(options: {
  readonly service?: ConversationMemoryService;
  readonly summaryId?: string;
} = {}): MemoryResult {
  const { service, ...rest } = options;
  return resolveService(service).summarizeMemory(rest);
}

export type { ConversationMemoryServiceDeps };
