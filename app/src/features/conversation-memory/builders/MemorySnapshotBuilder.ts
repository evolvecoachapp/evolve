import type { MemoryEntry } from "../models/MemoryEntry";
import {
  EMPTY_MEMORY_METADATA,
  type MemoryMetadata,
} from "../models/MemoryMetadata";
import type { MemorySnapshot } from "../models/MemorySnapshot";
import {
  isContextCategory,
  isDecisionCategory,
  isProfileCategory,
} from "../utils/categoryHelpers";
import { freezeSnapshot } from "../utils/FreezeMemoryState";
import { sortEntriesDeterministic } from "../utils/sortHelpers";
import { MemoryContextBuilder } from "./MemoryContextBuilder";

export interface MemorySnapshotBuilderInput {
  readonly id: string;
  readonly createdAt: string;
  readonly entries: readonly MemoryEntry[];
  readonly athleteId?: string | null;
  readonly conversationId?: string | null;
  readonly sessionId?: string | null;
  readonly turnCount?: number;
  readonly metadata?: MemoryMetadata;
}

/**
 * Builds an immutable MemorySnapshot with profile/context/decision lanes.
 */
export class MemorySnapshotBuilder {
  private readonly contextBuilder = new MemoryContextBuilder();

  build(input: MemorySnapshotBuilderInput): MemorySnapshot {
    const entries = sortEntriesDeterministic(input.entries);
    const profileEntries = entries.filter((e) => isProfileCategory(e.category));
    const contextEntries = entries.filter((e) => isContextCategory(e.category));
    const decisionEntries = entries.filter((e) =>
      isDecisionCategory(e.category),
    );
    const now = input.createdAt;
    const metadata = input.metadata ?? EMPTY_MEMORY_METADATA;

    const profile = Object.freeze({
      id: `${input.id}:profile`,
      athleteId: input.athleteId ?? null,
      entries: Object.freeze([...profileEntries]),
      entryCount: profileEntries.length,
      metadata,
      createdAt: now,
      frozenAt: now,
    });

    const context = this.contextBuilder.build({
      id: `${input.id}:context`,
      createdAt: now,
      entries: contextEntries,
      athleteId: input.athleteId,
      conversationId: input.conversationId,
      sessionId: input.sessionId,
      turnCount: input.turnCount,
      metadata,
    });

    const decision = Object.freeze({
      id: `${input.id}:decision`,
      athleteId: input.athleteId ?? null,
      conversationId: input.conversationId ?? null,
      entries: Object.freeze([...decisionEntries]),
      entryCount: decisionEntries.length,
      acceptedCount: decisionEntries.filter((e) =>
        e.value.toLowerCase().includes("accepted"),
      ).length,
      metadata,
      createdAt: now,
      frozenAt: now,
    });

    return freezeSnapshot({
      id: input.id,
      athleteId: input.athleteId ?? null,
      conversationId: input.conversationId ?? null,
      sessionId: input.sessionId ?? null,
      entries,
      profile,
      context,
      decision,
      entryCount: entries.length,
      metadata,
      createdAt: now,
      frozenAt: now,
    });
  }
}

export function buildMemorySnapshot(
  input: MemorySnapshotBuilderInput,
): MemorySnapshot {
  return new MemorySnapshotBuilder().build(input);
}
