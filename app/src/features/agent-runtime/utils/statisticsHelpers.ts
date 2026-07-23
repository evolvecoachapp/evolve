import type { AgentRuntimeEvent } from "../models/AgentRuntimeEvent";
import type { AgentExecutionResult } from "../models/AgentExecutionResult";

export interface RuntimeStatistics {
  readonly executionCount: number;
  readonly successCount: number;
  readonly failureCount: number;
  readonly eventCount: number;
  readonly lastCompletedAt: string | null;
}

export const EMPTY_RUNTIME_STATISTICS: RuntimeStatistics = Object.freeze({
  executionCount: 0,
  successCount: 0,
  failureCount: 0,
  eventCount: 0,
  lastCompletedAt: null,
});

export function createEmptyStatistics(): RuntimeStatistics {
  return { ...EMPTY_RUNTIME_STATISTICS };
}

export function recordExecution(
  stats: RuntimeStatistics,
  result: AgentExecutionResult,
): RuntimeStatistics {
  return Object.freeze({
    executionCount: stats.executionCount + 1,
    successCount: stats.successCount + (result.success ? 1 : 0),
    failureCount: stats.failureCount + (result.success ? 0 : 1),
    eventCount: stats.eventCount,
    lastCompletedAt: result.completedAt,
  });
}

export function recordEvents(
  stats: RuntimeStatistics,
  events: readonly AgentRuntimeEvent[],
): RuntimeStatistics {
  return Object.freeze({
    ...stats,
    eventCount: stats.eventCount + events.length,
  });
}
