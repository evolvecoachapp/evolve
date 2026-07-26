import { WorkoutPipelineStages } from "../models";
import { mapWorkoutPlanToWorkoutProgram } from "../adapters";
import { generateWorkoutPlan } from "../application";
import {
  createPipelineRequest,
  createTestWorkoutGenerationPipelineService,
} from "../testSupport/fixtures";

describe("Workout Generation Pipeline integration", () => {
  it("runs Session → Supervisor → Agent → Athlete → Fusion → Decision → Recommendation → Generation → WorkoutPlan", async () => {
    const service = createTestWorkoutGenerationPipelineService();
    const result = await generateWorkoutPlan({
      request: createPipelineRequest(),
      service,
    });

    expect(result.success).toBe(true);
    expect(result.plan).not.toBeNull();
    expect(result.session?.success).toBe(true);
    expect(result.supervisor?.success).toBe(true);
    expect(result.workoutAgent?.success).toBe(true);
    expect(result.athleteState?.success).toBe(true);
    expect(result.fusion?.success).toBe(true);
    expect(result.decision?.success).toBe(true);
    expect(result.recommendation?.success).toBe(true);
    expect(result.generation?.success).toBe(true);

    const stages = result.trace.map((item) => item.stage);
    expect(stages).toEqual(
      expect.arrayContaining([
        WorkoutPipelineStages.CONVERSATION,
        WorkoutPipelineStages.COACHING_SESSION,
        WorkoutPipelineStages.COACH_SUPERVISOR,
        WorkoutPipelineStages.WORKOUT_AGENT,
        WorkoutPipelineStages.ATHLETE_STATE,
        WorkoutPipelineStages.CONTEXT_FUSION,
        WorkoutPipelineStages.DECISION,
        WorkoutPipelineStages.RECOMMENDATION,
        WorkoutPipelineStages.WORKOUT_GENERATION,
        WorkoutPipelineStages.WORKOUT_PLAN,
        WorkoutPipelineStages.VALIDATION,
      ]),
    );

    expect(result.plan!.primarySession.exercises.length).toBeGreaterThan(0);
    expect(result.plan!.targets.length).toBeGreaterThan(0);
    expect(result.plan!.weeks.length).toBe(1);
    expect(result.validation.valid).toBe(true);
  });

  it("integrates Coach Supervisor and Workout Agent outputs into the plan", async () => {
    const service = createTestWorkoutGenerationPipelineService();
    const result = await generateWorkoutPlan({
      request: createPipelineRequest({ id: "pipeline-req:supervisor" }),
      service,
    });

    expect(result.success).toBe(true);
    expect(result.supervisor?.response).toBeTruthy();
    expect(result.generation?.proposal).toBeTruthy();
    expect(result.plan!.proposal.id).toBe(result.generation!.proposal.id);
  });

  it("integrates recommendations into WorkoutPlan statistics", async () => {
    const service = createTestWorkoutGenerationPipelineService();
    const result = await generateWorkoutPlan({
      request: createPipelineRequest({ id: "pipeline-req:reco" }),
      service,
    });

    expect(result.success).toBe(true);
    expect(result.recommendation).not.toBeNull();
    expect(result.plan!.statistics.decisionCount).toBe(
      result.decision!.decisions.length,
    );
    expect(result.plan!.statistics.recommendationCount).toBe(
      result.recommendation!.recommendations.length,
    );
  });

  it("produces WorkoutPlan output adaptable to legacy WorkoutProgram UI", async () => {
    const service = createTestWorkoutGenerationPipelineService();
    const result = await generateWorkoutPlan({
      request: createPipelineRequest({ id: "pipeline-req:ui" }),
      service,
    });

    expect(result.plan).not.toBeNull();
    const program = mapWorkoutPlanToWorkoutProgram(result.plan!);
    expect(program.id).toBe(result.plan!.id);
    expect(program.weeks.length).toBeGreaterThan(0);
    expect(program.weeks[0]!.days[0]!.exercises.length).toBeGreaterThan(0);
  });

  it("is deterministic for the same generation inputs", async () => {
    const generationRequest = createPipelineRequest().generationRequest;
    const serviceA = createTestWorkoutGenerationPipelineService();
    const serviceB = createTestWorkoutGenerationPipelineService();
    const a = await generateWorkoutPlan({
      request: createPipelineRequest({
        id: "pipeline-req:det-a",
        generationRequest,
      }),
      service: serviceA,
    });
    const b = await generateWorkoutPlan({
      request: createPipelineRequest({
        id: "pipeline-req:det-b",
        generationRequest,
      }),
      service: serviceB,
    });

    expect(a.success).toBe(true);
    expect(b.success).toBe(true);
    expect(a.plan!.primarySession.exercises.map((e) => e.exerciseId)).toEqual(
      b.plan!.primarySession.exercises.map((e) => e.exerciseId),
    );
  });
});
