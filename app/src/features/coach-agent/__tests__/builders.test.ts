import { buildCoachRequest } from "../builders/CoachRequestBuilder";
import { buildCoachExecutionContext } from "../builders/CoachExecutionContextBuilder";
import { buildCoachExecutionPlan } from "../builders/CoachExecutionPlanBuilder";
import { CoachResultBuilder } from "../builders/CoachResultBuilder";
import { CoachIntents } from "../models/CoachIntent";
import { EMPTY_COACH_METADATA } from "../models/CoachMetadata";
import { SpecialistAgentKinds } from "../models/SpecialistAgentKind";
import { FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("coach-agent builders", () => {
  it("builds immutable coach request", () => {
    const request = buildCoachRequest({
      id: "creq:1",
      message: "Train and recover",
      createdAt: FIXED_TIMESTAMP,
      intentHint: CoachIntents.MULTI_DOMAIN,
      agentHints: [SpecialistAgentKinds.WORKOUT, SpecialistAgentKinds.RECOVERY],
    });
    expect(request.agentHints).toHaveLength(2);
    expect(Object.isFrozen(request)).toBe(true);
  });

  it("builds immutable execution context and plan", () => {
    const request = buildCoachRequest({
      id: "creq:2",
      message: "Nutrition focus",
      createdAt: FIXED_TIMESTAMP,
      intentHint: CoachIntents.NUTRITION_FOCUS,
    });
    const context = buildCoachExecutionContext({
      id: "cctx:2",
      request,
      intent: CoachIntents.NUTRITION_FOCUS,
      selectedAgents: [SpecialistAgentKinds.NUTRITION],
      createdAt: FIXED_TIMESTAMP,
    });
    const plan = buildCoachExecutionPlan({
      id: "cplan:2",
      requestId: request.id,
      intent: CoachIntents.NUTRITION_FOCUS,
      agents: [SpecialistAgentKinds.NUTRITION],
      createdAt: FIXED_TIMESTAMP,
    });
    expect(context.selectedAgents).toEqual([SpecialistAgentKinds.NUTRITION]);
    expect(plan.steps).toHaveLength(1);
    expect(Object.isFrozen(context)).toBe(true);
    expect(Object.isFrozen(plan)).toBe(true);
  });

  it("builds summary and result", () => {
    const request = buildCoachRequest({
      id: "creq:3",
      message: "Holistic",
      createdAt: FIXED_TIMESTAMP,
    });
    const context = buildCoachExecutionContext({
      id: "cctx:3",
      request,
      intent: CoachIntents.HOLISTIC,
      selectedAgents: [...Object.values(SpecialistAgentKinds).slice(0, 3)],
      createdAt: FIXED_TIMESTAMP,
    });
    const plan = buildCoachExecutionPlan({
      id: "cplan:3",
      requestId: request.id,
      intent: CoachIntents.HOLISTIC,
      agents: context.selectedAgents,
      createdAt: FIXED_TIMESTAMP,
    });
    const decision = Object.freeze({
      id: "cdecision:3",
      accepted: true,
      confidenceScore: 0.8,
      recommendations: Object.freeze([]),
      conflicts: Object.freeze([]),
      prioritizedAgents: Object.freeze([...context.selectedAgents]),
      reasons: Object.freeze(["ok"]),
      metadata: EMPTY_COACH_METADATA,
      decidedAt: FIXED_TIMESTAMP,
    });
    const builder = new CoachResultBuilder();
    const summary = builder.buildSummary({
      requestId: request.id,
      intent: CoachIntents.HOLISTIC,
      agentsInvoked: context.selectedAgents,
      decision,
      success: true,
      message: "ok",
      createdAt: FIXED_TIMESTAMP,
    });
    const result = builder.buildResult({
      id: "cresult:3",
      request,
      context,
      plan,
      outputs: Object.freeze({
        workout: null,
        recovery: null,
        nutrition: null,
        invocations: Object.freeze([]),
        metadata: EMPTY_COACH_METADATA,
      }),
      decision,
      validation: Object.freeze({ valid: true, issues: Object.freeze([]) }),
      summary,
      events: Object.freeze([]),
      success: true,
      message: "ok",
      startedAt: FIXED_TIMESTAMP,
      completedAt: FIXED_TIMESTAMP,
    });
    expect(summary.success).toBe(true);
    expect(Object.isFrozen(result)).toBe(true);
  });
});
