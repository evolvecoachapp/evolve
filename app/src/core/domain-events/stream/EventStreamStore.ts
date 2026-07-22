import type { DomainEvent } from "../models/DomainEvent";
import type { DomainEventType } from "../models/DomainEventType";
import type { EventCategory } from "../models/EventCategory";
import type { EventSource } from "../models/EventSource";
import type { EventStream } from "../models/EventStream";
import { DomainEventError } from "../models/DomainEventError";
import { buildEventStream } from "../utils/buildEventStream";
import { freezeEvent } from "../utils/freezeEvents";
import {
  validateDuplicateSequence,
  validateEventOrdering,
} from "../validators/validateOrdering";

const FIXED_TIMESTAMP = "2026-07-22T00:00:00.000Z";

/**
 * In-memory append-only store that exposes immutable EventStream snapshots.
 * Maintains deterministic ordering. No persistence.
 */
export class EventStreamStore {
  private readonly events: DomainEvent[] = [];
  private sequence = 0;
  private readonly createdAt: string;

  constructor(
    private readonly streamId: string,
    private readonly sessionId: string,
    createdAt: string = FIXED_TIMESTAMP,
  ) {
    this.createdAt = createdAt;
  }

  get id(): string {
    return this.streamId;
  }

  getSessionId(): string {
    return this.sessionId;
  }

  getEventCount(): number {
    return this.events.length;
  }

  /**
   * Allocate the next monotonic sequence number.
   */
  nextSequence(): number {
    this.sequence += 1;
    return this.sequence;
  }

  peekNextSequence(): number {
    return this.sequence + 1;
  }

  /**
   * Append a frozen event. Rejects out-of-order or duplicate sequences.
   */
  append(event: DomainEvent): DomainEvent {
    const frozen = freezeEvent(event);
    const candidate = [...this.events, frozen];

    const orderingIssues = validateEventOrdering(candidate);
    const duplicateIssues = validateDuplicateSequence(candidate);
    const issues = [...orderingIssues, ...duplicateIssues];

    if (issues.length > 0) {
      const code = issues.some((issue) => issue.startsWith("duplicate_sequence"))
        ? "duplicate_sequence"
        : "invalid_ordering";
      throw new DomainEventError(code, issues.join("; "));
    }

    this.events.push(frozen);
    this.sequence = Math.max(this.sequence, frozen.sequence);
    return frozen;
  }

  /**
   * Read-only ordered collection.
   */
  getEvents(): readonly DomainEvent[] {
    return Object.freeze([...this.events]);
  }

  filterByCategory(category: EventCategory): readonly DomainEvent[] {
    return Object.freeze(
      this.events.filter((event) => event.category === category),
    );
  }

  filterBySource(source: EventSource): readonly DomainEvent[] {
    return Object.freeze(
      this.events.filter((event) => event.source === source),
    );
  }

  filterByType(type: DomainEventType): readonly DomainEvent[] {
    return Object.freeze(this.events.filter((event) => event.type === type));
  }

  /**
   * Immutable snapshot of the current stream.
   */
  getStream(): EventStream {
    return buildEventStream({
      id: this.streamId,
      sessionId: this.sessionId,
      events: this.getEvents(),
      createdAt: this.createdAt,
    });
  }
}
