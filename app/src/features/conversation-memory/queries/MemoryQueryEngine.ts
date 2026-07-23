import type { MemoryEntry } from "../models/MemoryEntry";
import type { MemoryQuery } from "../models/MemoryQuery";
import { MemoryQueryModes } from "../models/MemoryQuery";
import { sortEntriesDeterministic } from "../utils/sortHelpers";

/**
 * Deterministic in-process query layer over memory entries.
 *
 * No network. No persistence. No AI.
 */
export class MemoryQueryEngine {
  query(
    entries: readonly MemoryEntry[],
    query: MemoryQuery,
  ): readonly MemoryEntry[] {
    let result = [...entries];

    if (query.athleteId) {
      result = result.filter((e) => e.athleteId === query.athleteId);
    }
    if (query.conversationId) {
      result = result.filter((e) => e.conversationId === query.conversationId);
    }
    if (query.sessionId) {
      result = result.filter((e) => e.sessionId === query.sessionId);
    }

    switch (query.mode) {
      case MemoryQueryModes.BY_CATEGORY:
        if (query.category) {
          result = result.filter((e) => e.category === query.category);
        }
        break;
      case MemoryQueryModes.BY_IDENTIFIER:
        if (query.identifierId) {
          result = result.filter((e) => e.id === query.identifierId);
        } else if (query.key) {
          result = result.filter((e) => e.key === query.key);
        }
        break;
      case MemoryQueryModes.BY_PRIORITY:
        if (query.minPriority != null) {
          result = result.filter((e) => e.priority >= query.minPriority!);
        }
        break;
      case MemoryQueryModes.BY_TIME:
        if (query.fromTime) {
          result = result.filter((e) => e.updatedAt >= query.fromTime!);
        }
        if (query.toTime) {
          result = result.filter((e) => e.updatedAt <= query.toTime!);
        }
        break;
      case MemoryQueryModes.BY_SCOPE:
        if (query.scope) {
          result = result.filter((e) => e.scope === query.scope);
        }
        break;
      case MemoryQueryModes.LATEST:
        result = [...sortEntriesDeterministic(result)];
        if (query.category) {
          result = result.filter((e) => e.category === query.category);
        }
        result = result.slice(0, query.limit ?? 1);
        return Object.freeze(result);
      case MemoryQueryModes.HISTORICAL:
        if (query.fromTime) {
          result = result.filter((e) => e.updatedAt >= query.fromTime!);
        }
        if (query.toTime) {
          result = result.filter((e) => e.updatedAt <= query.toTime!);
        }
        result = [...result].sort((a, b) => {
          if (a.updatedAt === b.updatedAt) {
            return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
          }
          return a.updatedAt < b.updatedAt ? -1 : 1;
        });
        break;
      default:
        break;
    }

    if (query.latestOnly) {
      result = [...sortEntriesDeterministic(result)].slice(0, 1);
    } else if (query.mode !== MemoryQueryModes.HISTORICAL) {
      result = [...sortEntriesDeterministic(result)];
    }

    if (query.limit != null && query.limit >= 0) {
      result = result.slice(0, query.limit);
    }

    return Object.freeze(result);
  }

  byCategory(
    entries: readonly MemoryEntry[],
    category: MemoryEntry["category"],
  ): readonly MemoryEntry[] {
    return Object.freeze(
      sortEntriesDeterministic(entries.filter((e) => e.category === category)),
    );
  }

  byIdentifier(
    entries: readonly MemoryEntry[],
    id: string,
  ): MemoryEntry | null {
    return entries.find((e) => e.id === id) ?? null;
  }

  byPriority(
    entries: readonly MemoryEntry[],
    minPriority: number,
  ): readonly MemoryEntry[] {
    return Object.freeze(
      sortEntriesDeterministic(
        entries.filter((e) => e.priority >= minPriority),
      ),
    );
  }

  byTime(
    entries: readonly MemoryEntry[],
    fromTime: string | null,
    toTime: string | null,
  ): readonly MemoryEntry[] {
    let result = [...entries];
    if (fromTime) result = result.filter((e) => e.updatedAt >= fromTime);
    if (toTime) result = result.filter((e) => e.updatedAt <= toTime);
    return Object.freeze(sortEntriesDeterministic(result));
  }

  byScope(
    entries: readonly MemoryEntry[],
    scope: MemoryEntry["scope"],
  ): readonly MemoryEntry[] {
    return Object.freeze(
      sortEntriesDeterministic(entries.filter((e) => e.scope === scope)),
    );
  }

  latest(
    entries: readonly MemoryEntry[],
    limit = 1,
  ): readonly MemoryEntry[] {
    return Object.freeze(
      [...sortEntriesDeterministic(entries)].slice(0, limit),
    );
  }

  historical(
    entries: readonly MemoryEntry[],
  ): readonly MemoryEntry[] {
    return Object.freeze(
      [...entries].sort((a, b) => {
        if (a.updatedAt === b.updatedAt) {
          return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
        }
        return a.updatedAt < b.updatedAt ? -1 : 1;
      }),
    );
  }
}

export function createMemoryQueryEngine(): MemoryQueryEngine {
  return new MemoryQueryEngine();
}
