import type { EventStream, EventStreamSummary } from "../models/EventStream";
import { aggregateEvents } from "./aggregateEvents";
import { freezeEventStreamSummary } from "./freezeEvents";

/**
 * Build a compact summary of an EventStream.
 */
export function summarizeStream(stream: EventStream): EventStreamSummary {
  const aggregates = aggregateEvents(stream.events);
  const first = stream.events[0] ?? null;
  const last = stream.events[stream.events.length - 1] ?? null;

  return freezeEventStreamSummary({
    streamId: stream.id,
    sessionId: stream.sessionId,
    totalEvents: stream.eventCount,
    byCategory: aggregates.byCategory,
    bySource: aggregates.bySource,
    byType: aggregates.byType,
    firstTimestamp: first?.timestamp ?? null,
    lastTimestamp: last?.timestamp ?? stream.lastEventAt,
    summaryText: `${stream.eventCount} domain events in stream ${stream.id}`,
  });
}
