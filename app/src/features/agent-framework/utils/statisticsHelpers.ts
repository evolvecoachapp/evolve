import type { AgentStatistics } from "../models/AgentStatistics";
import { EMPTY_AGENT_STATISTICS } from "../models/AgentStatistics";
import { freezeStatistics } from "./FreezeAgent";

export function createEmptyStatistics(): AgentStatistics {
  return EMPTY_AGENT_STATISTICS;
}

export function incrementResolve(
  stats: AgentStatistics,
  resolvedAt: string,
): AgentStatistics {
  return freezeStatistics({
    ...stats,
    resolveCount: stats.resolveCount + 1,
    lastResolvedAt: resolvedAt,
  });
}

export function incrementRegistration(
  stats: AgentStatistics,
): AgentStatistics {
  return freezeStatistics({
    ...stats,
    registrationCount: stats.registrationCount + 1,
  });
}

export function recordSessionOutcome(
  stats: AgentStatistics,
  options: {
    readonly success: boolean;
    readonly durationMs: number;
    readonly completedAt: string;
  },
): AgentStatistics {
  const sessionCount = stats.sessionCount + 1;
  const successCount = stats.successCount + (options.success ? 1 : 0);
  const failureCount = stats.failureCount + (options.success ? 0 : 1);
  const totalDuration =
    stats.averageDurationMs * stats.sessionCount + options.durationMs;
  return freezeStatistics({
    ...stats,
    sessionCount,
    successCount,
    failureCount,
    averageDurationMs:
      sessionCount === 0 ? 0 : Math.round(totalDuration / sessionCount),
    lastCompletedAt: options.completedAt,
  });
}

export function summarizeStatistics(stats: AgentStatistics): string {
  return [
    `registrations=${stats.registrationCount}`,
    `resolves=${stats.resolveCount}`,
    `sessions=${stats.sessionCount}`,
    `success=${stats.successCount}`,
    `failure=${stats.failureCount}`,
    `avgMs=${stats.averageDurationMs}`,
  ].join(" ");
}
