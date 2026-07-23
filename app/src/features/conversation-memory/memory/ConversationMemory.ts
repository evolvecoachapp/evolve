import { MemoryResultBuilder } from "../builders/MemoryResultBuilder";
import { MemorySnapshotBuilder } from "../builders/MemorySnapshotBuilder";
import type { MemoryEntry } from "../models/MemoryEntry";
import { MemoryEventTypes } from "../models/MemoryEvent";
import { MemoryOperationKinds } from "../models/MemoryResult";
import type { MemoryQuery } from "../models/MemoryQuery";
import type { MemoryResult } from "../models/MemoryResult";
import type { MemoryUpdate } from "../models/MemoryUpdate";
import { MemoryValidationCodes } from "../models/MemoryValidation";
import {
  createMemoryConflictPolicy,
  createMemoryMergePolicy,
  createMemoryRetentionPolicy,
  type MemoryConflictPolicy,
  type MemoryMergePolicy,
  type MemoryRetentionPolicy,
} from "../policies";
import {
  createMemoryQueryEngine,
  type MemoryQueryEngine,
} from "../queries/MemoryQueryEngine";
import {
  createMemoryTimelineTracker,
  type MemoryTimelineTracker,
} from "../timeline/MemoryTimelineTracker";
import { resolveMemoryLane } from "../utils/categoryHelpers";
import { freezeEntry, freezeValidation } from "../utils/FreezeMemoryState";
import {
  validateCategoryCompatibility,
  validateMemoryEntry,
  validateMemoryQuery,
  validateMemorySnapshot,
  validateMemoryUpdate,
  validateTimelineIntegrity,
} from "../validators";

export interface ConversationMemoryDeps {
  readonly memoryId?: string;
  readonly athleteId?: string | null;
  readonly conversationId?: string | null;
  readonly sessionId?: string | null;
  readonly maxEntries?: number;
  readonly clock?: () => string;
  readonly queryEngine?: MemoryQueryEngine;
  readonly retentionPolicy?: MemoryRetentionPolicy;
  readonly mergePolicy?: MemoryMergePolicy;
  readonly conflictPolicy?: MemoryConflictPolicy;
  readonly timeline?: MemoryTimelineTracker;
}

/**
 * Conversation Memory — structured coaching knowledge orchestration.
 *
 * Receive memory operations → resolve category → build immutable snapshot →
 * return MemoryResult.
 *
 * Not chat history. No AI. No prompts. No persistence implementation.
 */
export class ConversationMemory {
  readonly id: string;

  private readonly athleteId: string | null;
  private readonly conversationId: string | null;
  private readonly sessionId: string | null;
  private readonly maxEntries: number;
  private readonly clock: () => string;
  private readonly queryEngine: MemoryQueryEngine;
  private readonly retentionPolicy: MemoryRetentionPolicy;
  private readonly mergePolicy: MemoryMergePolicy;
  private readonly conflictPolicy: MemoryConflictPolicy;
  private readonly timeline: MemoryTimelineTracker;
  private readonly snapshotBuilder = new MemorySnapshotBuilder();
  private readonly resultBuilder = new MemoryResultBuilder();
  private entries: MemoryEntry[] = [];
  private resultCounter = 0;

  constructor(deps: ConversationMemoryDeps = {}) {
    this.id = deps.memoryId ?? "memory:conversation:default";
    this.athleteId = deps.athleteId ?? null;
    this.conversationId = deps.conversationId ?? null;
    this.sessionId = deps.sessionId ?? null;
    this.maxEntries = deps.maxEntries ?? 100;
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.queryEngine = deps.queryEngine ?? createMemoryQueryEngine();
    this.retentionPolicy =
      deps.retentionPolicy ?? createMemoryRetentionPolicy();
    this.mergePolicy = deps.mergePolicy ?? createMemoryMergePolicy();
    this.conflictPolicy =
      deps.conflictPolicy ?? createMemoryConflictPolicy();
    this.timeline =
      deps.timeline ??
      createMemoryTimelineTracker({
        timelineId: `${this.id}:timeline`,
        athleteId: this.athleteId,
        conversationId: this.conversationId,
        sessionId: this.sessionId,
        clock: this.clock,
      });
  }

  listEntries(): readonly MemoryEntry[] {
    return Object.freeze([...this.entries]);
  }

  save(entry: MemoryEntry): MemoryResult {
    const startedAt = this.clock();
    const entryValidation = validateMemoryEntry(entry);
    const categoryValidation = validateCategoryCompatibility(entry.category);

    if (!entryValidation.valid || !categoryValidation.valid) {
      return this.fail(
        MemoryOperationKinds.SAVE,
        "Memory entry validation failed.",
        startedAt,
        [],
        freezeValidation({
          valid: false,
          issues: Object.freeze([
            ...entryValidation.issues,
            ...categoryValidation.issues,
          ]),
        }),
      );
    }

    const lane = resolveMemoryLane(entry.category);
    const next = freezeEntry({
      ...entry,
      athleteId: entry.athleteId ?? this.athleteId,
      conversationId: entry.conversationId ?? this.conversationId,
      sessionId: entry.sessionId ?? this.sessionId,
    });

    const withoutSameId = this.entries.filter((e) => e.id !== next.id);
    const merged = this.mergePolicy.merge([...withoutSameId, next]);
    const retained = this.retentionPolicy.retain(merged, this.maxEntries);
    this.entries = [...retained];

    const event = this.timeline.recordSaved(next.id, next.category);
    const snapshot = this.snapshotBuilder.build({
      id: `${this.id}:snapshot:${++this.resultCounter}`,
      createdAt: this.clock(),
      entries: this.entries,
      athleteId: this.athleteId,
      conversationId: this.conversationId,
      sessionId: this.sessionId,
    });

    return this.resultBuilder.buildResult({
      id: `${this.id}:result:${this.resultCounter}`,
      operation: MemoryOperationKinds.SAVE,
      success: true,
      message: `Saved ${lane} memory ${next.id}`,
      entries: Object.freeze([next]),
      snapshot,
      timeline: this.timeline.snapshot(),
      validation: entryValidation,
      events: Object.freeze([event]),
      startedAt,
      completedAt: this.clock(),
    });
  }

  load(entryId: string): MemoryResult {
    const startedAt = this.clock();
    if (!entryId) {
      return this.fail(
        MemoryOperationKinds.LOAD,
        "Entry id is required.",
        startedAt,
        [],
        freezeValidation({
          valid: false,
          issues: Object.freeze([
            Object.freeze({
              code: MemoryValidationCodes.MISSING_FIELD,
              message: "Entry id is required.",
              path: "entryId",
            }),
          ]),
        }),
      );
    }

    const found = this.queryEngine.byIdentifier(this.entries, entryId);
    const event = this.timeline.append({
      type: MemoryEventTypes.LOADED,
      entryId,
      category: found?.category ?? null,
      message: found
        ? `Memory entry loaded: ${entryId}`
        : `Memory entry not found: ${entryId}`,
    });

    return this.resultBuilder.buildResult({
      id: `${this.id}:result:${++this.resultCounter}`,
      operation: MemoryOperationKinds.LOAD,
      success: found != null,
      message: found ? `Loaded ${entryId}` : `Not found: ${entryId}`,
      entries: found ? Object.freeze([found]) : Object.freeze([]),
      timeline: this.timeline.snapshot(),
      validation: freezeValidation({
        valid: true,
        issues: Object.freeze([]),
      }),
      events: Object.freeze([event]),
      startedAt,
      completedAt: this.clock(),
    });
  }

  query(query: MemoryQuery): MemoryResult {
    const startedAt = this.clock();
    const validation = validateMemoryQuery(query);
    if (!validation.valid) {
      return this.fail(
        MemoryOperationKinds.QUERY,
        "Memory query validation failed.",
        startedAt,
        [],
        validation,
      );
    }

    const matched = this.queryEngine.query(this.entries, query);
    const event = this.timeline.recordQueried(matched.length);

    return this.resultBuilder.buildResult({
      id: `${this.id}:result:${++this.resultCounter}`,
      operation: MemoryOperationKinds.QUERY,
      success: true,
      message: `Query returned ${matched.length} entries`,
      entries: matched,
      timeline: this.timeline.snapshot(),
      validation,
      events: Object.freeze([event]),
      startedAt,
      completedAt: this.clock(),
    });
  }

  update(update: MemoryUpdate): MemoryResult {
    const startedAt = this.clock();
    const validation = validateMemoryUpdate(update);
    if (!validation.valid) {
      return this.fail(
        MemoryOperationKinds.UPDATE,
        "Memory update validation failed.",
        startedAt,
        [],
        validation,
      );
    }

    const existing = this.entries.find((e) => e.id === update.entryId);
    if (!existing) {
      return this.fail(
        MemoryOperationKinds.UPDATE,
        `Memory entry not found: ${update.entryId}`,
        startedAt,
        [],
        freezeValidation({
          valid: false,
          issues: Object.freeze([
            Object.freeze({
              code: MemoryValidationCodes.UPDATE_INVALID,
              message: `Memory entry not found: ${update.entryId}`,
              path: "update.entryId",
            }),
          ]),
        }),
      );
    }

    const updated = freezeEntry({
      ...existing,
      value: update.value ?? existing.value,
      summary: update.summary ?? existing.summary,
      priority: update.priority ?? existing.priority,
      metadata: update.metadata ?? existing.metadata,
      version: existing.version + 1,
      updatedAt: update.createdAt || this.clock(),
    });

    const entryValidation = validateMemoryEntry(updated);
    if (!entryValidation.valid) {
      return this.fail(
        MemoryOperationKinds.UPDATE,
        "Updated memory entry validation failed.",
        startedAt,
        [],
        entryValidation,
      );
    }

    this.entries = this.entries.map((e) =>
      e.id === updated.id ? updated : e,
    );
    const event = this.timeline.recordUpdated(updated.id, updated.category);

    return this.resultBuilder.buildResult({
      id: `${this.id}:result:${++this.resultCounter}`,
      operation: MemoryOperationKinds.UPDATE,
      success: true,
      message: `Updated ${updated.id}`,
      entries: Object.freeze([updated]),
      timeline: this.timeline.snapshot(),
      validation: entryValidation,
      events: Object.freeze([event]),
      startedAt,
      completedAt: this.clock(),
    });
  }

  buildSnapshot(options: {
    readonly snapshotId?: string;
    readonly turnCount?: number;
  } = {}): MemoryResult {
    const startedAt = this.clock();
    const snapshot = this.snapshotBuilder.build({
      id: options.snapshotId ?? `${this.id}:snapshot:${++this.resultCounter}`,
      createdAt: startedAt,
      entries: this.entries,
      athleteId: this.athleteId,
      conversationId: this.conversationId,
      sessionId: this.sessionId,
      turnCount: options.turnCount,
    });
    const validation = validateMemorySnapshot(snapshot);
    const event = this.timeline.recordSnapshotBuilt(snapshot.id);
    const timeline = this.timeline.snapshot();
    const timelineValidation = validateTimelineIntegrity(timeline);

    return this.resultBuilder.buildResult({
      id: `${this.id}:result:${this.resultCounter}`,
      operation: MemoryOperationKinds.SNAPSHOT,
      success: validation.valid && timelineValidation.valid,
      message: validation.valid
        ? `Snapshot ${snapshot.id}`
        : "Snapshot validation failed.",
      entries: snapshot.entries,
      snapshot,
      timeline,
      validation: freezeValidation({
        valid: validation.valid && timelineValidation.valid,
        issues: Object.freeze([
          ...validation.issues,
          ...timelineValidation.issues,
        ]),
      }),
      events: Object.freeze([event]),
      startedAt,
      completedAt: this.clock(),
    });
  }

  summarize(options: { readonly summaryId?: string } = {}): MemoryResult {
    const startedAt = this.clock();
    const summary = this.resultBuilder.buildSummary({
      id: options.summaryId ?? `${this.id}:summary:${++this.resultCounter}`,
      createdAt: startedAt,
      entries: this.entries,
      athleteId: this.athleteId,
      conversationId: this.conversationId,
    });
    const event = this.timeline.append({
      type: MemoryEventTypes.SUMMARIZED,
      message: summary.message,
    });

    return this.resultBuilder.buildResult({
      id: `${this.id}:result:${this.resultCounter}`,
      operation: MemoryOperationKinds.SUMMARIZE,
      success: true,
      message: summary.message,
      entries: Object.freeze([...this.entries]),
      summary,
      timeline: this.timeline.snapshot(),
      validation: freezeValidation({
        valid: true,
        issues: Object.freeze([]),
      }),
      events: Object.freeze([event]),
      startedAt,
      completedAt: this.clock(),
    });
  }

  detectConflicts() {
    return this.conflictPolicy.findConflicts(this.entries);
  }

  private fail(
    operation: MemoryResult["operation"],
    message: string,
    startedAt: string,
    entries: readonly MemoryEntry[],
    validation: MemoryResult["validation"],
  ): MemoryResult {
    return this.resultBuilder.buildResult({
      id: `${this.id}:result:${++this.resultCounter}`,
      operation,
      success: false,
      message,
      entries,
      validation,
      timeline: this.timeline.snapshot(),
      events: Object.freeze([]),
      startedAt,
      completedAt: this.clock(),
    });
  }
}

export function createConversationMemory(
  deps: ConversationMemoryDeps = {},
): ConversationMemory {
  return new ConversationMemory(deps);
}
