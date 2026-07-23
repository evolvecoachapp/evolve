import { countByStatus } from "./AggregationHelpers";
import type { AgentExecutionSummary } from "../models/AgentExecutionSummary";
import type { CoachSupervisorPlan } from "../models/CoachSupervisorPlan";
import type { CoachSupervisorStatistics } from "../models/CoachSupervisorStatistics";

export function buildStatistics(input: {
  readonly plan: CoachSupervisorPlan | null;
  readonly summaries: readonly AgentExecutionSummary[];
}): CoachSupervisorStatistics {
  const counts = countByStatus(input.summaries);
  const plan = input.plan;
  return Object.freeze({
    agentCount: plan?.coordination.orderedAgentIds.length ?? 0,
    capabilityCount: plan?.coordination.orderedCapabilityIds.length ?? 0,
    stepCount: plan?.coordination.steps.length ?? 0,
    phaseCount: plan?.coordination.phases.length ?? 0,
    successCount: counts.successCount,
    failureCount: counts.failureCount,
    skippedCount: counts.skippedCount,
  });
}
