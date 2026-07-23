import {
  WorkoutContextBuilder,
  WorkoutPlanBuilder,
  WorkoutRecommendationBuilder,
} from "../builders";
import {
  createFixedClock,
  createMockActionPlan,
  createMockCoachResponse,
  createMockToolExecutionResult,
  createWorkoutRequestFixture,
} from "../testSupport/fixtures";
import { labelFromScore } from "../models/WorkoutConfidence";
import { EMPTY_WORKOUT_AGENT_METADATA } from "../models/WorkoutAgentMetadata";

describe("workout-agent builders", () => {
  const clock = createFixedClock();

  it("WorkoutContextBuilder freezes context and links mocks", () => {
    const context = new WorkoutContextBuilder().build({
      request: createWorkoutRequestFixture(),
      coachResponse: createMockCoachResponse(),
      actionPlan: createMockActionPlan(),
      toolExecutionResult: createMockToolExecutionResult(),
      memoryTurnCount: 3,
      clock,
    });
    expect(Object.isFrozen(context)).toBe(true);
    expect(context.coachResponseId).toBe("coach:resp:1");
    expect(context.actionPlanId).toBe("action:plan:1");
    expect(context.toolResultIds).toEqual(["texec:result:1"]);
    expect(context.memoryTurnCount).toBe(3);
    expect(context.strategy?.objective).toBe(context.objective);
  });

  it("WorkoutPlanBuilder builds proposal", () => {
    const context = new WorkoutContextBuilder().build({
      request: createWorkoutRequestFixture(),
      clock,
    });
    const proposal = new WorkoutPlanBuilder().buildProposal({ context, clock });
    expect(proposal.daysPerWeek).toBe(4);
    expect(Object.isFrozen(proposal)).toBe(true);
  });

  it("WorkoutRecommendationBuilder builds recommendations", () => {
    const context = new WorkoutContextBuilder().build({
      request: createWorkoutRequestFixture(),
      clock,
    });
    const proposal = new WorkoutPlanBuilder().buildProposal({ context, clock });
    const decision = Object.freeze({
      id: "decision:builder",
      intent: context.intent,
      objective: context.objective,
      strategyId: null,
      proposal,
      accepted: true,
      confidence: Object.freeze({
        score: 0.7,
        label: labelFromScore(0.7),
        rationale: null,
      }),
      reasons: Object.freeze([] as string[]),
      policyFlags: Object.freeze([] as string[]),
      metadata: EMPTY_WORKOUT_AGENT_METADATA,
      decidedAt: clock(),
    });
    const recs = new WorkoutRecommendationBuilder().build({
      decision,
      proposal,
    });
    expect(recs.length).toBeGreaterThan(0);
  });
});
