import {
  createAthleteToolAdapter,
  createCoachToolAdapter,
  createRecoveryToolAdapter,
  createWorkoutToolAdapter,
} from "../adapters";
import { DomainToolIds } from "../models/DomainToolIds";
import {
  createDomainToolRequest,
  createMockDomainResult,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("domain-tools adapters", () => {
  it("WorkoutToolAdapter executes generate and analyze", async () => {
    const adapter = createWorkoutToolAdapter({
      clock: () => FIXED_TIMESTAMP,
      nowMs: () => 1000,
      generateWorkoutProgram: async () =>
        createMockDomainResult("generate") as never,
      analyzeWorkoutPerformance: () =>
        createMockDomainResult("analyze") as never,
    });

    const generate = await adapter.execute(
      createDomainToolRequest({
        toolId: DomainToolIds.WORKOUT_GENERATE,
        parameters: { request: { athleteContext: { id: "a1" } } },
      }),
    );
    expect(generate.status).toBe("succeeded");
    expect(generate.output?.data).toEqual(
      expect.objectContaining({ tag: "generate" }),
    );

    const analyze = await adapter.execute(
      createDomainToolRequest({
        toolId: DomainToolIds.WORKOUT_ANALYZE_PERFORMANCE,
        parameters: {
          workoutResult: { id: "w1" },
          eventStream: { id: "e1" },
        },
      }),
    );
    expect(analyze.status).toBe("succeeded");
  });

  it("RecoveryToolAdapter executes analyze and summarize", async () => {
    const adapter = createRecoveryToolAdapter({
      clock: () => FIXED_TIMESTAMP,
      nowMs: () => 1000,
      analyzeRecovery: () => createMockDomainResult("recovery") as never,
      summarizeRecovery: () => createMockDomainResult("summary") as never,
    });

    const analyze = await adapter.execute(
      createDomainToolRequest({
        toolId: DomainToolIds.RECOVERY_ANALYZE,
        parameters: {
          athleteHistory: { id: "h1" },
          performanceSnapshot: { id: "p1" },
        },
      }),
    );
    expect(analyze.status).toBe("succeeded");

    const summarize = await adapter.execute(
      createDomainToolRequest({
        toolId: DomainToolIds.RECOVERY_SUMMARIZE,
        parameters: { snapshot: { id: "s1" } },
      }),
    );
    expect(summarize.status).toBe("succeeded");
  });

  it("CoachToolAdapter executes prepare, insights, summarize", async () => {
    const adapter = createCoachToolAdapter({
      clock: () => FIXED_TIMESTAMP,
      nowMs: () => 1000,
      prepareCoachingContext: () => createMockDomainResult("prepare") as never,
      generateInsights: () => createMockDomainResult("insights") as never,
      summarizeCoachingContext: () =>
        createMockDomainResult("summarize") as never,
    });

    const prepare = await adapter.execute(
      createDomainToolRequest({
        toolId: DomainToolIds.COACH_PREPARE_CONTEXT,
        parameters: { insightSnapshot: { id: "i1" } },
      }),
    );
    expect(prepare.status).toBe("succeeded");

    const insights = await adapter.execute(
      createDomainToolRequest({
        toolId: DomainToolIds.COACH_GENERATE_INSIGHTS,
        parameters: {
          performanceSnapshot: { id: "p1" },
          achievementResult: { id: "a1" },
          recoverySnapshot: { id: "r1" },
          athleteHistory: { id: "h1" },
        },
      }),
    );
    expect(insights.status).toBe("succeeded");

    const summarize = await adapter.execute(
      createDomainToolRequest({
        toolId: DomainToolIds.COACH_SUMMARIZE,
        parameters: { contextOrSnapshot: { id: "c1" } },
      }),
    );
    expect(summarize.status).toBe("succeeded");
  });

  it("AthleteToolAdapter executes history and achievements", async () => {
    const adapter = createAthleteToolAdapter({
      clock: () => FIXED_TIMESTAMP,
      nowMs: () => 1000,
      buildAthleteHistory: () => createMockDomainResult("history") as never,
      summarizeHistory: () => createMockDomainResult("summary") as never,
      evaluateAchievements: () =>
        createMockDomainResult("achievements") as never,
    });

    const history = await adapter.execute(
      createDomainToolRequest({
        toolId: DomainToolIds.ATHLETE_BUILD_HISTORY,
        parameters: { athleteId: "athlete-1" },
      }),
    );
    expect(history.status).toBe("succeeded");

    const achievements = await adapter.execute(
      createDomainToolRequest({
        toolId: DomainToolIds.ATHLETE_EVALUATE_ACHIEVEMENTS,
        parameters: {
          performanceSnapshot: { id: "p1" },
          workoutResult: { id: "w1" },
        },
      }),
    );
    expect(achievements.status).toBe("succeeded");
  });

  it("adapters fail on invalid mapping without calling domain", async () => {
    let called = false;
    const adapter = createWorkoutToolAdapter({
      clock: () => FIXED_TIMESTAMP,
      nowMs: () => 1000,
      generateWorkoutProgram: async () => {
        called = true;
        return createMockDomainResult("x") as never;
      },
      analyzeWorkoutPerformance: () => createMockDomainResult("x") as never,
    });

    const result = await adapter.execute(
      createDomainToolRequest({
        toolId: DomainToolIds.WORKOUT_GENERATE,
        parameters: {},
      }),
    );

    expect(result.status).toBe("failed");
    expect(result.error?.code).toBe("invalid_parameters");
    expect(called).toBe(false);
  });

  it("adapters expose descriptors and domain identity", () => {
    const adapter = createWorkoutToolAdapter({
      generateWorkoutProgram: async () => ({}) as never,
      analyzeWorkoutPerformance: () => ({}) as never,
    });
    expect(adapter.domain()).toBe("workout");
    expect(adapter.listTools().length).toBe(2);
    expect(adapter.describe(DomainToolIds.WORKOUT_GENERATE)?.id).toBe(
      DomainToolIds.WORKOUT_GENERATE,
    );
  });
});
