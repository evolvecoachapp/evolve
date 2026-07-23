import type { MemoryEntry } from "../models/MemoryEntry";
import type { MemoryQuery } from "../models/MemoryQuery";
import type { MemoryResult } from "../models/MemoryResult";
import type { MemoryUpdate } from "../models/MemoryUpdate";
import {
  ConversationMemory,
  createConversationMemory,
  type ConversationMemoryDeps,
} from "../memory/ConversationMemory";

export interface ConversationMemoryServiceDeps extends ConversationMemoryDeps {
  readonly memory?: ConversationMemory;
}

/**
 * Conversation Memory Service — save / load / query / snapshot orchestration.
 *
 * No networking. No persistence implementation. No provider SDKs. No prompts. No AI.
 */
export class ConversationMemoryService {
  private readonly memory: ConversationMemory;

  constructor(deps: ConversationMemoryServiceDeps = {}) {
    this.memory = deps.memory ?? createConversationMemory(deps);
  }

  getMemory(): ConversationMemory {
    return this.memory;
  }

  saveMemory(entry: MemoryEntry): MemoryResult {
    return this.memory.save(entry);
  }

  loadMemory(entryId: string): MemoryResult {
    return this.memory.load(entryId);
  }

  queryMemory(query: MemoryQuery): MemoryResult {
    return this.memory.query(query);
  }

  updateMemory(update: MemoryUpdate): MemoryResult {
    return this.memory.update(update);
  }

  buildMemorySnapshot(options: {
    readonly snapshotId?: string;
    readonly turnCount?: number;
  } = {}): MemoryResult {
    return this.memory.buildSnapshot(options);
  }

  summarizeMemory(options: { readonly summaryId?: string } = {}): MemoryResult {
    return this.memory.summarize(options);
  }
}

export function createConversationMemoryService(
  deps: ConversationMemoryServiceDeps = {},
): ConversationMemoryService {
  return new ConversationMemoryService(deps);
}
