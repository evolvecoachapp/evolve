import type { AgentExecutionSummary } from "../models/AgentExecutionSummary";
import type { CoachSupervisorPlan } from "../models/CoachSupervisorPlan";
import type { CoachSupervisorSummary } from "../models/CoachSupervisorSummary";
import { freezeSummary } from "../utils/FreezeSupervisorState";
import { buildStatistics } from "../utils/StatisticsHelpers";

export function buildSupervisorSummary(input: {
  readonly id: string;
  readonly requestId: string;
  readonly plan: CoachSupervisorPlan | null;
  readonly summaries: readonly AgentExecutionSummary[];
  readonly createdAt: string;
}): CoachSupervisorSummary {
  const statistics = buildStatistics({
    plan: input.plan,
    summaries: input.summaries,
  });
  return freezeSummary({
    id: input.id,
    requestId: input.requestId,
    planId: input.plan?.id ?? null,
    headline: input.plan
      ? `Coordinated ${statistics.agentCount} agents`
      : "No plan",
    details: Object.freeze([
      `steps=${statistics.stepCount}`,
      `success=${statistics.successCount}`,
      `failure=${statistics.failureCount}`,
    ]),
    statistics,
    createdAt: input.createdAt,
  });
}
