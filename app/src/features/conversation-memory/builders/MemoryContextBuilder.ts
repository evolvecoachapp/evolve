import type { MemoryContext } from "../models/MemoryContext";
import type { MemoryEntry } from "../models/MemoryEntry";
import {
  EMPTY_MEMORY_METADATA,
  type MemoryMetadata,
} from "../models/MemoryMetadata";
import { isContextCategory } from "../utils/categoryHelpers";
import { freezeContext } from "../utils/FreezeMemoryState";
import { sortEntriesDeterministic } from "../utils/sortHelpers";

export interface MemoryContextBuilderInput {
  readonly id: string;
  readonly createdAt: string;
  readonly entries?: readonly MemoryEntry[];
  readonly athleteId?: string | null;
  readonly conversationId?: string | null;
  readonly sessionId?: string | null;
  readonly turnCount?: number;
  readonly metadata?: MemoryMetadata;
}

/**
 * Builds an immutable Context Memory projection.
 */
export class MemoryContextBuilder {
  build(input: MemoryContextBuilderInput): MemoryContext {
    const entries = sortEntriesDeterministic(
      (input.entries ?? []).filter((e) => isContextCategory(e.category)),
    );
    return freezeContext({
      id: input.id,
      athleteId: input.athleteId ?? null,
      conversationId: input.conversationId ?? null,
      sessionId: input.sessionId ?? null,
      entries,
      entryCount: entries.length,
      turnCount: input.turnCount ?? entries.length,
      metadata: input.metadata ?? EMPTY_MEMORY_METADATA,
      createdAt: input.createdAt,
      frozenAt: input.createdAt,
    });
  }
}

export function buildMemoryContext(
  input: MemoryContextBuilderInput,
): MemoryContext {
  return new MemoryContextBuilder().build(input);
}
