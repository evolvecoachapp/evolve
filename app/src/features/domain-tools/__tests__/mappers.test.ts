import { DomainToolIds } from "../models/DomainToolIds";
import { AthleteRequestMapper } from "../mappers/AthleteRequestMapper";
import { AthleteResultMapper } from "../mappers/AthleteResultMapper";
import { CoachRequestMapper } from "../mappers/CoachRequestMapper";
import { CoachResultMapper } from "../mappers/CoachResultMapper";
import { RecoveryRequestMapper } from "../mappers/RecoveryRequestMapper";
import { RecoveryResultMapper } from "../mappers/RecoveryResultMapper";
import { WorkoutRequestMapper } from "../mappers/WorkoutRequestMapper";
import { WorkoutResultMapper } from "../mappers/WorkoutResultMapper";

describe("domain-tools mappers", () => {
  it("WorkoutRequestMapper maps generate request", () => {
    const result = WorkoutRequestMapper.map(DomainToolIds.WORKOUT_GENERATE, {
      parameters: Object.freeze({
        request: Object.freeze({ athleteContext: { id: "a1" } }),
      }),
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.mapped.toolId).toBe(DomainToolIds.WORKOUT_GENERATE);
      expect(Object.isFrozen(result.mapped)).toBe(true);
    }
  });

  it("WorkoutRequestMapper rejects missing analyze inputs", () => {
    const result = WorkoutRequestMapper.map(
      DomainToolIds.WORKOUT_ANALYZE_PERFORMANCE,
      { parameters: Object.freeze({}) },
    );
    expect(result.ok).toBe(false);
  });

  it("WorkoutResultMapper freezes output data", () => {
    const result = WorkoutResultMapper.map({
      requestId: "r1",
      summary: "ok",
    } as never);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(Object.isFrozen(result.output)).toBe(true);
    }
  });

  it("RecoveryRequestMapper maps analyze request", () => {
    const result = RecoveryRequestMapper.map(DomainToolIds.RECOVERY_ANALYZE, {
      parameters: Object.freeze({
        athleteHistory: Object.freeze({ id: "h1" }),
        performanceSnapshot: Object.freeze({ id: "p1" }),
      }),
    });
    expect(result.ok).toBe(true);
  });

  it("RecoveryResultMapper maps summary", () => {
    const result = RecoveryResultMapper.map({
      snapshotId: "s1",
      status: "ok",
    } as never);
    expect(result.ok).toBe(true);
  });

  it("CoachRequestMapper maps prepare context", () => {
    const result = CoachRequestMapper.map(DomainToolIds.COACH_PREPARE_CONTEXT, {
      parameters: Object.freeze({
        insightSnapshot: Object.freeze({ id: "i1" }),
      }),
    });
    expect(result.ok).toBe(true);
  });

  it("CoachRequestMapper maps generate insights", () => {
    const result = CoachRequestMapper.map(
      DomainToolIds.COACH_GENERATE_INSIGHTS,
      {
        parameters: Object.freeze({
          performanceSnapshot: Object.freeze({ id: "p1" }),
          achievementResult: Object.freeze({ id: "a1" }),
          recoverySnapshot: Object.freeze({ id: "r1" }),
          athleteHistory: Object.freeze({ id: "h1" }),
        }),
      },
    );
    expect(result.ok).toBe(true);
  });

  it("CoachResultMapper maps engine result", () => {
    expect(CoachResultMapper.map({ context: {} } as never).ok).toBe(true);
  });

  it("AthleteRequestMapper maps build history and achievements", () => {
    const history = AthleteRequestMapper.map(
      DomainToolIds.ATHLETE_BUILD_HISTORY,
      {
        parameters: Object.freeze({
          athleteId: "athlete-1",
          workoutResult: Object.freeze({ id: "w1" }),
        }),
      },
    );
    expect(history.ok).toBe(true);

    const achievements = AthleteRequestMapper.map(
      DomainToolIds.ATHLETE_EVALUATE_ACHIEVEMENTS,
      {
        parameters: Object.freeze({
          performanceSnapshot: Object.freeze({ id: "p1" }),
          workoutResult: Object.freeze({ id: "w1" }),
          baselines: Object.freeze({ highest_weight: 100 }),
        }),
      },
    );
    expect(achievements.ok).toBe(true);
    if (achievements.ok && achievements.mapped.toolId === DomainToolIds.ATHLETE_EVALUATE_ACHIEVEMENTS) {
      expect(typeof achievements.mapped.baselineProvider.getBaseline).toBe(
        "function",
      );
    }
  });

  it("AthleteResultMapper maps history result", () => {
    expect(
      AthleteResultMapper.map({ history: { id: "h1" } } as never).ok,
    ).toBe(true);
  });
});
