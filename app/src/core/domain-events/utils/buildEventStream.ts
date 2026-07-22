import type { DomainEvent } from "../models/DomainEvent";
import type { EventStream } from "../models/EventStream";
import { freezeEventStream } from "./freezeEvents";

const FIXED_TIMESTAMP = "2026-07-22T00:00:00.000Z";

/**
 * Build an immutable EventStream snapshot from ordered events.
 */
export function buildEventStream(input: {
  readonly id: string;
  readonly sessionId: string;
  readonly events: readonly DomainEvent[];
  readonly createdAt?: string;
}): EventStream {
  const events = Object.freeze([...input.events]);
  const last = events[events.length - 1] ?? null;

  return freezeEventStream({
    id: input.id,
    sessionId: input.sessionId,
    events,
    eventCount: events.length,
    createdAt: input.createdAt ?? FIXED_TIMESTAMP,
    lastEventAt: last?.timestamp ?? null,
  });
}
