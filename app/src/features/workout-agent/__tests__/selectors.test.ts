import {
  ExerciseSelector,
  IntentSelector,
  ObjectiveSelector,
  RecommendationSelector,
  SplitSelector,
  StrategySelector,
} from "../selectors";
import { WorkoutIntents } from "../models/WorkoutIntent";
import { WorkoutObjectives } from "../models/WorkoutObjective";
import { WorkoutPlanBuilder } from "../builders/WorkoutPlanBuilder";
import { WorkoutContextBuilder } from "../builders/WorkoutContextBuilder";
import {
  createFixedClock,
  createWorkoutRequestFixture,
} from "../testSupport/fixtures";
import { labelFromScore } from "../models/WorkoutConfidence";
import { EMPTY_WORKOUT_AGENT_METADATA } from "../models/WorkoutAgentMetadata";

describe("workout-agent selectors", () => {
  it("IntentSelector detects plan intent", () => {
    expect(
      new IntentSelector().select({
        intentHint: null,
        message: "Please plan my workout",
      }),
    ).toBe(WorkoutIntents.PLAN_WORKOUT);
  });

  it("ObjectiveSelector detects hypertrophy", () => {
    expect(
      new ObjectiveSelector().select({
        objectiveHint: null,
        intent: WorkoutIntents.PLAN_WORKOUT,
        message: "I want hypertrophy muscle growth",
      }),
    ).toBe(WorkoutObjectives.HYPERTROPHY);
  });

  it("StrategySelector / SplitSelector / ExerciseSelector work", () => {
    const clock = createFixedClock();
    const context = new WorkoutContextBuilder().build({
      request: createWorkoutRequestFixture(),
      clock,
    });
    const proposal = new WorkoutPlanBuilder().buildProposal({ context, clock });
    expect(new StrategySelector().select(context.objective).id).toContain(
      "hypertrophy",
    );
    expect(new SplitSelector().select(proposal, 4)).toBe(proposal.split);
    expect(new ExerciseSelector().selectPrimaries(proposal).length).toBeGreaterThan(
      0,
    );
  });

  it("RecommendationSelector returns recommendations", () => {
    const clock = createFixedClock();
    const context = new WorkoutContextBuilder().build({
      request: createWorkoutRequestFixture(),
      clock,
    });
    const proposal = new WorkoutPlanBuilder().buildProposal({ context, clock });
    const decision = Object.freeze({
      id: "decision:test",
      intent: context.intent,
      objective: context.objective,
      strategyId: context.strategy?.id ?? null,
      proposal,
      accepted: true,
      confidence: Object.freeze({
        score: 0.8,
        label: labelFromScore(0.8),
        rationale: null,
      }),
      reasons: Object.freeze(["ok"]),
      policyFlags: Object.freeze([] as string[]),
      metadata: EMPTY_WORKOUT_AGENT_METADATA,
      decidedAt: clock(),
    });
    const recs = new RecommendationSelector().select({ decision, proposal });
    expect(recs.length).toBeGreaterThan(0);
    expect(Object.isFrozen(recs[0])).toBe(true);
  });
});
