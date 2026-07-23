import type { MemoryCategory } from "../models/MemoryCategory";
import type { MemoryEvent } from "../models/MemoryEvent";
import { MemoryEventTypes, type MemoryEventType } from "../models/MemoryEvent";
import { EMPTY_MEMORY_METADATA } from "../models/MemoryMetadata";
import type { MemoryTimeline } from "../models/MemoryTimeline";
import { freezeEvent, freezeTimeline } from "../utils/FreezeMemoryState";

export interface MemoryTimelineTrackerDeps {
  readonly timelineId?: string;
  readonly athleteId?: string | null;
  readonly conversationId?: string | null;
  readonly sessionId?: string | null;
  readonly clock?: () => string;
}

/**
 * Tracks ordered memory events and produces immutable timeline snapshots.
 */
export class MemoryTimelineTracker {
  private readonly timelineId: string;
  private readonly athleteId: string | null;
  private readonly conversationId: string | null;
  private readonly sessionId: string | null;
  private readonly clock: () => string;
  private readonly createdAt: string;
  private events: MemoryEvent[] = [];
  private nextSequence = 1;

  constructor(deps: MemoryTimelineTrackerDeps = {}) {
    this.timelineId = deps.timelineId ?? "timeline:memory:default";
    this.athleteId = deps.athleteId ?? null;
    this.conversationId = deps.conversationId ?? null;
    this.sessionId = deps.sessionId ?? null;
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.createdAt = this.clock();
  }

  append(input: {
    readonly type: MemoryEventType;
    readonly entryId?: string | null;
    readonly category?: MemoryCategory | null;
    readonly message: string;
    readonly occurredAt?: string;
  }): MemoryEvent {
    const event = freezeEvent({
      id: `${this.timelineId}:event:${this.nextSequence}`,
      type: input.type,
      entryId: input.entryId ?? null,
      category: input.category ?? null,
      message: input.message,
      sequence: this.nextSequence,
      metadata: EMPTY_MEMORY_METADATA,
      occurredAt: input.occurredAt ?? this.clock(),
    });
    this.events = [...this.events, event];
    this.nextSequence += 1;
    return event;
  }

  recordSaved(entryId: string, category: MemoryCategory): MemoryEvent {
    return this.append({
      type: MemoryEventTypes.SAVED,
      entryId,
      category,
      message: `Memory entry saved: ${entryId}`,
    });
  }

  recordUpdated(entryId: string, category: MemoryCategory): MemoryEvent {
    return this.append({
      type: MemoryEventTypes.UPDATED,
      entryId,
      category,
      message: `Memory entry updated: ${entryId}`,
    });
  }

  recordQueried(count: number): MemoryEvent {
    return this.append({
      type: MemoryEventTypes.QUERIED,
      message: `Memory query returned ${count} entries`,
    });
  }

  recordSnapshotBuilt(snapshotId: string): MemoryEvent {
    return this.append({
      type: MemoryEventTypes.SNAPSHOT_BUILT,
      message: `Memory snapshot built: ${snapshotId}`,
    });
  }

  snapshot(): MemoryTimeline {
    const now = this.clock();
    return freezeTimeline({
      id: this.timelineId,
      athleteId: this.athleteId,
      conversationId: this.conversationId,
      sessionId: this.sessionId,
      events: Object.freeze([...this.events]),
      eventCount: this.events.length,
      nextSequence: this.nextSequence,
      metadata: EMPTY_MEMORY_METADATA,
      createdAt: this.createdAt,
      updatedAt: now,
      frozenAt: now,
    });
  }

  getEvents(): readonly MemoryEvent[] {
    return Object.freeze([...this.events]);
  }
}

export function createMemoryTimelineTracker(
  deps: MemoryTimelineTrackerDeps = {},
): MemoryTimelineTracker {
  return new MemoryTimelineTracker(deps);
}
