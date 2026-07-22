import type { DomainEvent } from "../models/DomainEvent";
import type { EventContext } from "../models/EventContext";
import type { EventMetadata } from "../models/EventMetadata";
import type { EventStream, EventStreamSummary } from "../models/EventStream";

export function freezeMetadata(metadata: EventMetadata): EventMetadata {
  return Object.freeze({
    tags: Object.freeze([...metadata.tags]),
    attributes: Object.freeze({ ...metadata.attributes }),
  });
}

export function freezeContext(context: EventContext): EventContext {
  return Object.freeze({ ...context });
}

export function freezeEvent<T extends DomainEvent>(event: T): T {
  return Object.freeze({
    ...event,
    metadata: freezeMetadata(event.metadata),
    context: freezeContext(event.context),
    payload: Object.freeze({ ...event.payload }),
  }) as unknown as T;
}

export function freezeEvents(
  events: readonly DomainEvent[],
): readonly DomainEvent[] {
  return Object.freeze(events.map((event) => freezeEvent(event)));
}

export function freezeEventStream(stream: EventStream): EventStream {
  return Object.freeze({
    id: stream.id,
    sessionId: stream.sessionId,
    events: freezeEvents(stream.events),
    eventCount: stream.eventCount,
    createdAt: stream.createdAt,
    lastEventAt: stream.lastEventAt,
  });
}

export function freezeEventStreamSummary(
  summary: EventStreamSummary,
): EventStreamSummary {
  return Object.freeze({
    streamId: summary.streamId,
    sessionId: summary.sessionId,
    totalEvents: summary.totalEvents,
    byCategory: Object.freeze({ ...summary.byCategory }),
    bySource: Object.freeze({ ...summary.bySource }),
    byType: Object.freeze({ ...summary.byType }),
    firstTimestamp: summary.firstTimestamp,
    lastTimestamp: summary.lastTimestamp,
    summaryText: summary.summaryText,
  });
}
