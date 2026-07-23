import type { MemoryEntry } from "../models/MemoryEntry";
import type { MemoryEvent } from "../models/MemoryEvent";
import {
  EMPTY_MEMORY_METADATA,
  type MemoryMetadata,
} from "../models/MemoryMetadata";
import type {
  MemoryOperationKind,
  MemoryResult,
} from "../models/MemoryResult";
import type { MemorySnapshot } from "../models/MemorySnapshot";
import type { MemorySummary } from "../models/MemorySummary";
import type { MemoryTimeline } from "../models/MemoryTimeline";
import type { MemoryValidation } from "../models/MemoryValidation";
import {
  isContextCategory,
  isDecisionCategory,
  isProfileCategory,
} from "../utils/categoryHelpers";
import { freezeResult, freezeSummary } from "../utils/FreezeMemoryState";

/**
 * Builds immutable memory results / summaries.
 */
export class MemoryResultBuilder {
  buildSummary(input: {
    readonly id: string;
    readonly createdAt: string;
    readonly entries: readonly MemoryEntry[];
    readonly athleteId?: string | null;
    readonly conversationId?: string | null;
    readonly message?: string;
  }): MemorySummary {
    const categories = Object.freeze(
      [...new Set(input.entries.map((e) => e.category))].sort(),
    );
    return freezeSummary({
      id: input.id,
      athleteId: input.athleteId ?? null,
      conversationId: input.conversationId ?? null,
      entryCount: input.entries.length,
      profileCount: input.entries.filter((e) => isProfileCategory(e.category))
        .length,
      contextCount: input.entries.filter((e) => isContextCategory(e.category))
        .length,
      decisionCount: input.entries.filter((e) =>
        isDecisionCategory(e.category),
      ).length,
      categories,
      message: input.message ?? `Summarized ${input.entries.length} memories`,
      createdAt: input.createdAt,
    });
  }

  buildResult(input: {
    readonly id: string;
    readonly operation: MemoryOperationKind;
    readonly success: boolean;
    readonly message: string | null;
    readonly entries: readonly MemoryEntry[];
    readonly validation: MemoryValidation;
    readonly startedAt: string;
    readonly completedAt: string;
    readonly snapshot?: MemorySnapshot | null;
    readonly summary?: MemorySummary | null;
    readonly timeline?: MemoryTimeline | null;
    readonly events?: readonly MemoryEvent[];
    readonly metadata?: MemoryMetadata;
  }): MemoryResult {
    return freezeResult({
      id: input.id,
      operation: input.operation,
      success: input.success,
      message: input.message,
      entries: Object.freeze([...input.entries]),
      snapshot: input.snapshot ?? null,
      summary: input.summary ?? null,
      timeline: input.timeline ?? null,
      validation: input.validation,
      events: Object.freeze([...(input.events ?? [])]),
      metadata: input.metadata ?? EMPTY_MEMORY_METADATA,
      startedAt: input.startedAt,
      completedAt: input.completedAt,
      frozenAt: input.completedAt,
    });
  }
}

export function buildMemorySummary(
  input: Parameters<MemoryResultBuilder["buildSummary"]>[0],
): MemorySummary {
  return new MemoryResultBuilder().buildSummary(input);
}

export function buildMemoryResult(
  input: Parameters<MemoryResultBuilder["buildResult"]>[0],
): MemoryResult {
  return new MemoryResultBuilder().buildResult(input);
}
