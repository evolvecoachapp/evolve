import type { LogLevel } from "../levels/LogLevel";
import { LOG_LEVELS } from "../levels/LogLevel";

/**
 * Immutable logging statistics snapshot.
 */
export interface LogStatistics {
  readonly totalCount: number;
  readonly flushedCount: number;
  readonly countsByLevel: Readonly<Record<LogLevel, number>>;
  readonly lastEntryId: string | null;
}

export function createLogStatistics(
  input: {
    readonly totalCount?: number;
    readonly flushedCount?: number;
    readonly countsByLevel?: Partial<Record<LogLevel, number>>;
    readonly lastEntryId?: string | null;
  } = {},
): LogStatistics {
  const countsByLevel = Object.freeze(
    Object.fromEntries(
      LOG_LEVELS.map((level) => [
        level,
        input.countsByLevel?.[level] ?? 0,
      ]),
    ) as Record<LogLevel, number>,
  );

  return Object.freeze({
    totalCount: input.totalCount ?? 0,
    flushedCount: input.flushedCount ?? 0,
    countsByLevel,
    lastEntryId: input.lastEntryId ?? null,
  });
}
