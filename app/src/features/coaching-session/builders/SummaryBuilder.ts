import type { SessionContext } from "../models/SessionContext";
import type { SessionSummary } from "../models/SessionSummary";
import { formatSessionHeadline } from "../utils/FormattingHelpers";
import { computeSessionStatistics } from "../utils/StatisticsHelpers";
import { freezeSummary } from "../utils/FreezeSessionState";

export function buildSessionSummary(input: {
  readonly id: string;
  readonly context: SessionContext;
  readonly agentInvocationCount: number;
  readonly successCount: number;
  readonly failureCount: number;
  readonly createdAt: string;
}): SessionSummary {
  const statistics = computeSessionStatistics({
    history: input.context.history,
    checkpointCount: input.context.checkpoint ? 1 : 0,
    agentInvocationCount: input.agentInvocationCount,
    successCount: input.successCount,
    failureCount: input.failureCount,
  });
  return freezeSummary({
    id: input.id,
    sessionId: input.context.sessionId,
    headline: formatSessionHeadline({
      sessionId: input.context.sessionId,
      status: input.context.state.status,
      turnCount: statistics.turnCount,
    }),
    details: Object.freeze([
      `phase=${input.context.state.phase}`,
      `lifecycle=${input.context.lifecycle.stage}`,
      `events=${statistics.eventCount}`,
    ]),
    statistics,
    createdAt: input.createdAt,
  });
}
