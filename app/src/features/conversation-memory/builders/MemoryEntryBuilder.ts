import type { MemoryCategory } from "../models/MemoryCategory";
import type { MemoryEntry } from "../models/MemoryEntry";
import type { MemoryIdentifier } from "../models/MemoryIdentifier";
import {
  EMPTY_MEMORY_METADATA,
  type MemoryMetadata,
} from "../models/MemoryMetadata";
import {
  MemoryPriorities,
  type MemoryPriority,
} from "../models/MemoryPriority";
import { MemoryScopes, type MemoryScope } from "../models/MemoryScope";
import { freezeEntry } from "../utils/FreezeMemoryState";

export interface MemoryEntryBuilderInput {
  readonly id: string;
  readonly category: MemoryCategory;
  readonly key: string;
  readonly value: string;
  readonly createdAt: string;
  readonly updatedAt?: string;
  readonly scope?: MemoryScope;
  readonly priority?: MemoryPriority;
  readonly summary?: string | null;
  readonly athleteId?: string | null;
  readonly conversationId?: string | null;
  readonly sessionId?: string | null;
  readonly version?: number;
  readonly metadata?: MemoryMetadata;
  readonly identifier?: MemoryIdentifier;
}

/**
 * Builds an immutable MemoryEntry. No domain calculations.
 */
export class MemoryEntryBuilder {
  build(input: MemoryEntryBuilderInput): MemoryEntry {
    const scope = input.scope ?? MemoryScopes.CONVERSATION;
    const athleteId = input.athleteId ?? null;
    const conversationId = input.conversationId ?? null;
    const sessionId = input.sessionId ?? null;
    const identifier =
      input.identifier ??
      Object.freeze({
        id: input.id,
        category: input.category,
        scope,
        athleteId,
        conversationId,
        sessionId,
        key: input.key,
      });

    return freezeEntry({
      id: input.id,
      identifier,
      category: input.category,
      scope,
      priority: input.priority ?? MemoryPriorities.NORMAL,
      key: input.key,
      value: input.value,
      summary: input.summary ?? null,
      athleteId,
      conversationId,
      sessionId,
      version: input.version ?? 1,
      metadata: input.metadata ?? EMPTY_MEMORY_METADATA,
      createdAt: input.createdAt,
      updatedAt: input.updatedAt ?? input.createdAt,
    });
  }
}

export function buildMemoryEntry(
  input: MemoryEntryBuilderInput,
): MemoryEntry {
  return new MemoryEntryBuilder().build(input);
}
