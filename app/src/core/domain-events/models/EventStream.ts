import type { DomainEvent } from "./DomainEvent";

/**
 * Immutable, ordered collection of domain events for one execution session.
 * No persistence — in-memory only.
 */
export interface EventStream {
  readonly id: string;
  readonly sessionId: string;
  readonly events: readonly DomainEvent[];
  readonly eventCount: number;
  readonly createdAt: string;
  readonly lastEventAt: string | null;
}

/**
 * Aggregate summary of an EventStream.
 */
export interface EventStreamSummary {
  readonly streamId: string;
  readonly sessionId: string;
  readonly totalEvents: number;
  readonly byCategory: Readonly<Record<string, number>>;
  readonly bySource: Readonly<Record<string, number>>;
  readonly byType: Readonly<Record<string, number>>;
  readonly firstTimestamp: string | null;
  readonly lastTimestamp: string | null;
  readonly summaryText: string;
}
