import type { DomainEvent } from "../models/DomainEvent";

export interface EventAggregates {
  readonly byCategory: Readonly<Record<string, number>>;
  readonly bySource: Readonly<Record<string, number>>;
  readonly byType: Readonly<Record<string, number>>;
}

function increment(
  map: Record<string, number>,
  key: string,
): void {
  map[key] = (map[key] ?? 0) + 1;
}

/**
 * Aggregate counts by category, source, and type.
 */
export function aggregateEvents(
  events: readonly DomainEvent[],
): EventAggregates {
  const byCategory: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  const byType: Record<string, number> = {};

  for (const event of events) {
    increment(byCategory, event.category);
    increment(bySource, event.source);
    increment(byType, event.type);
  }

  return Object.freeze({
    byCategory: Object.freeze(byCategory),
    bySource: Object.freeze(bySource),
    byType: Object.freeze(byType),
  });
}
