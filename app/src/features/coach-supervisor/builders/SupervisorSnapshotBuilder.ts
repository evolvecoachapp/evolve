import type { AggregationResult } from "../models/AggregationResult";
import type { CoachSupervisorContext } from "../models/CoachSupervisorContext";
import type { CoachSupervisorExecution } from "../models/CoachSupervisorExecution";
import { EMPTY_SUPERVISOR_METADATA } from "../models/CoachSupervisorMetadata";
import type { CoachSupervisorPlan } from "../models/CoachSupervisorPlan";
import type { CoachSupervisorRequest } from "../models/CoachSupervisorRequest";
import type { CoachSupervisorSnapshot } from "../models/CoachSupervisorSnapshot";
import type { CoachSupervisorSummary } from "../models/CoachSupervisorSummary";
import type { UnifiedCoachResponse } from "../models/UnifiedCoachResponse";
import { freezeSnapshot } from "../utils/FreezeSupervisorState";

export function buildSupervisorSnapshot(input: {
  readonly id: string;
  readonly request: CoachSupervisorRequest;
  readonly context?: CoachSupervisorContext | null;
  readonly plan?: CoachSupervisorPlan | null;
  readonly execution?: CoachSupervisorExecution | null;
  readonly aggregation?: AggregationResult | null;
  readonly response?: UnifiedCoachResponse | null;
  readonly summary?: CoachSupervisorSummary | null;
  readonly createdAt: string;
}): CoachSupervisorSnapshot {
  const agentIds =
    input.plan?.coordination.orderedAgentIds ??
    input.response?.agentIds ??
    [];
  return freezeSnapshot({
    id: input.id,
    request: input.request,
    context: input.context ?? null,
    plan: input.plan ?? null,
    execution: input.execution ?? null,
    aggregation: input.aggregation ?? null,
    response: input.response ?? null,
    summary: input.summary ?? null,
    agentIds: Object.freeze([...agentIds]),
    metadata: EMPTY_SUPERVISOR_METADATA,
    createdAt: input.createdAt,
    frozenAt: input.createdAt,
  });
}
