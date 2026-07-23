import { createResultAggregator } from "../aggregation/ResultAggregator";
import { buildAggregationContext } from "../builders/AggregationContextBuilder";
import { createCollaborationPlanner } from "../planning/CollaborationPlanner";
import { CollaborationStatuses } from "../models/CollaborationStatus";
import { EMPTY_COLLABORATION_METADATA } from "../models/CollaborationMetadata";
import type { ExecutionResult } from "../models/ExecutionResult";
import { freezeExecutionResult } from "../utils/FreezeCollaborationState";
import {
  createCoachRequest,
  createFixedClock,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

function resultFixture(
  overrides: Partial<ExecutionResult> & {
    readonly agentId: string;
    readonly order: number;
  },
): ExecutionResult {
  return freezeExecutionResult({
    id: overrides.id ?? `result:${overrides.agentId}`,
    collaborationId: overrides.collaborationId ?? "collaboration:agg",
    planId: overrides.planId ?? "plan:collaboration:agg",
    batchId: overrides.batchId ?? "batch:1",
    taskId: overrides.taskId ?? `task:${overrides.agentId}`,
    participantId: overrides.participantId ?? `participant:${overrides.agentId}`,
    agentId: overrides.agentId,
    order: overrides.order,
    success: overrides.success ?? true,
    status: overrides.status ?? CollaborationStatuses.COMPLETED,
    message: overrides.message ?? "ok",
    attributes: overrides.attributes ?? Object.freeze({}),
    error: overrides.error ?? null,
    metadata: overrides.metadata ?? EMPTY_COLLABORATION_METADATA,
    startedAt: overrides.startedAt ?? FIXED_TIMESTAMP,
    completedAt: overrides.completedAt ?? FIXED_TIMESTAMP,
    durationMs: overrides.durationMs ?? 1,
    frozenAt: overrides.frozenAt ?? FIXED_TIMESTAMP,
  });
}

describe("agent-collaboration aggregation", () => {
  it("preserves ordering and provenance deterministically", () => {
    const planner = createCollaborationPlanner();
    const plan = planner.plan({
      request: createCoachRequest(),
      collaborationId: "collaboration:agg",
      clock: createFixedClock(),
    });

    const results = [
      resultFixture({ agentId: "agent:recovery", order: 3, planId: plan.id }),
      resultFixture({ agentId: "agent:workout", order: 1, planId: plan.id }),
      resultFixture({ agentId: "agent:nutrition", order: 2, planId: plan.id }),
    ];

    const aggregator = createResultAggregator();
    const aggregation = aggregator.aggregate({
      collaborationId: "collaboration:agg",
      plan,
      results,
      clock: createFixedClock(),
    });

    expect(aggregation.orderedAgentIds).toEqual([
      "agent:workout",
      "agent:nutrition",
      "agent:recovery",
    ]);
    expect(aggregation.provenance[0]).toContain("agent:workout");
    expect(aggregation.successCount).toBe(3);
    expect(aggregation.failureCount).toBe(0);
    expect(Object.isFrozen(aggregation)).toBe(true);
  });

  it("reports failures without scoring or ranking", () => {
    const planner = createCollaborationPlanner();
    const plan = planner.plan({
      request: createCoachRequest({
        requestedRoles: ["workout" as const, "nutrition" as const],
      }),
      collaborationId: "collaboration:agg-fail",
      clock: createFixedClock(),
    });

    const context = buildAggregationContext({
      id: "ctx:1",
      collaborationId: "collaboration:agg-fail",
      plan,
      results: [
        resultFixture({
          agentId: "agent:workout",
          order: 1,
          planId: plan.id,
          success: true,
        }),
        resultFixture({
          agentId: "agent:nutrition",
          order: 2,
          planId: plan.id,
          success: false,
          status: CollaborationStatuses.FAILED,
        }),
      ],
      createdAt: FIXED_TIMESTAMP,
    });

    const aggregation = createResultAggregator().aggregateFromContext({
      context,
      clock: createFixedClock(),
    });

    expect(aggregation.success).toBe(false);
    expect(aggregation.failureCount).toBe(1);
    expect(aggregation.provenance[1]).toContain(":fail");
  });
});
