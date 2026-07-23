import { CoachIntents } from "../models/CoachIntent";
import { CoachExecutionStatuses } from "../models/CoachExecutionState";
import { EMPTY_COACH_METADATA } from "../models/CoachMetadata";
import { SpecialistAgentKinds } from "../models/SpecialistAgentKind";
import { AgentCapabilityResolver } from "../selectors/AgentCapabilityResolver";
import {
  validateAgentCompatibility,
  validateCoachRequest,
  validateExecutionLifecycle,
  validateExecutionPlan,
  validateMergedResult,
} from "../validators";
import { buildCoachExecutionPlan } from "../builders/CoachExecutionPlanBuilder";
import { createCoachRequestFixture, FIXED_TIMESTAMP } from "../testSupport/fixtures";

describe("coach-agent validators", () => {
  it("validates coach request shape", () => {
    expect(validateCoachRequest(null).valid).toBe(false);
    expect(validateCoachRequest(createCoachRequestFixture()).valid).toBe(true);
    expect(
      validateCoachRequest(
        createCoachRequestFixture({ message: "" }),
      ).valid,
    ).toBe(false);
  });

  it("validates execution plan and agent compatibility", () => {
    const plan = buildCoachExecutionPlan({
      id: "cplan:1",
      requestId: "creq:1",
      intent: CoachIntents.WORKOUT_FOCUS,
      agents: [SpecialistAgentKinds.WORKOUT],
      createdAt: FIXED_TIMESTAMP,
    });
    expect(validateExecutionPlan(plan).valid).toBe(true);
    expect(validateExecutionPlan(null).valid).toBe(false);

    const compatibility = validateAgentCompatibility({
      intent: CoachIntents.WORKOUT_FOCUS,
      agents: [SpecialistAgentKinds.WORKOUT],
      resolver: new AgentCapabilityResolver(),
    });
    expect(compatibility.valid).toBe(true);

    const future = validateAgentCompatibility({
      intent: CoachIntents.HOLISTIC,
      agents: [SpecialistAgentKinds.SLEEP],
    });
    expect(future.valid).toBe(false);
  });

  it("validates merged result and lifecycle", () => {
    expect(
      validateMergedResult({
        id: "cdecision:1",
        accepted: true,
        confidenceScore: 0.9,
        recommendations: Object.freeze([]),
        conflicts: Object.freeze([]),
        prioritizedAgents: Object.freeze([SpecialistAgentKinds.WORKOUT]),
        reasons: Object.freeze(["ok"]),
        metadata: EMPTY_COACH_METADATA,
        decidedAt: FIXED_TIMESTAMP,
      }).valid,
    ).toBe(true);

    expect(
      validateMergedResult({
        id: "cdecision:bad",
        accepted: true,
        confidenceScore: 2,
        recommendations: Object.freeze([]),
        conflicts: Object.freeze([]),
        prioritizedAgents: Object.freeze([]),
        reasons: Object.freeze([]),
        metadata: EMPTY_COACH_METADATA,
        decidedAt: FIXED_TIMESTAMP,
      }).valid,
    ).toBe(false);

    expect(
      validateExecutionLifecycle({
        id: "cstate:1",
        requestId: "creq:1",
        planId: "cplan:1",
        status: CoachExecutionStatuses.COMPLETED,
        currentAgent: null,
        errorMessage: null,
        metadata: EMPTY_COACH_METADATA,
        updatedAt: FIXED_TIMESTAMP,
      }).valid,
    ).toBe(true);
  });
});
