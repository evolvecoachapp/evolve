import {
  CoachConversationIntents,
  CoachConversationStages,
  processCoachConversationTurn,
} from "../index";
import {
  createCoachConversationRequest,
  createTestCoachConversationService,
  generateAndAttachPlan,
} from "../testSupport/fixtures";
import {
  WorkoutModificationKinds,
  modifyWorkoutPlan,
  validateAdaptedWorkoutPlan,
} from "../../workout-generation-pipeline";
import {
  createPipelineRequest,
  createTestWorkoutGenerationPipelineService,
} from "../../workout-generation-pipeline/testSupport/fixtures";
import { generateWorkoutPlan } from "../../workout-generation-pipeline/application";
import { EMPTY_PLAN_METADATA } from "../../workout-generation-pipeline/models";
import { routeWorkoutModificationKind } from "../../workout-generation-pipeline/modification";

describe("Adaptive workout modification integration", () => {
  it("replaces an exercise without regenerating the full plan", async () => {
    const service = createTestCoachConversationService();
    const plan = await generateAndAttachPlan(service);
    const originalIds = plan.primarySession.exercises.map((item) => item.id);
    const originalWeek = plan.progression.weekNumber;

    const result = processCoachConversationTurn({
      service,
      request: createCoachConversationRequest({
        id: "coach-conv-req:replace",
        message: "Replace the first exercise with an alternative movement",
      }),
    });

    expect(result.intent).toBe(CoachConversationIntents.WORKOUT_MODIFICATION);
    expect(result.modification?.success).toBe(true);
    expect(result.modification?.kind).toBe(
      WorkoutModificationKinds.REPLACE_EXERCISE,
    );
    expect(result.workoutPlan?.id).not.toBe(plan.id);
    expect(result.workoutPlan?.progression.weekNumber).toBe(originalWeek);
    expect(result.workoutPlan?.recommendationPackageId).toBe(
      plan.recommendationPackageId,
    );
    expect(result.message).toMatch(/replaced|adapted/i);
    expect(result.trace.map((item) => item.stage)).toEqual(
      expect.arrayContaining([
        CoachConversationStages.WORKOUT_MODIFICATION,
        CoachConversationStages.RESPONSE,
      ]),
    );

    const updatedNames = result.workoutPlan!.primarySession.exercises.map(
      (item) => item.name,
    );
    expect(updatedNames.some((name) => name.includes("adapted"))).toBe(true);
    // Ordering length preserved for replace
    expect(result.workoutPlan!.primarySession.exercises.length).toBe(
      originalIds.length,
    );
  });

  it("adapts for unavailable equipment", async () => {
    const service = createTestCoachConversationService();
    await generateAndAttachPlan(service);

    const result = processCoachConversationTurn({
      service,
      request: createCoachConversationRequest({
        id: "coach-conv-req:equipment",
        message: "I don't have a barbell available today",
      }),
    });

    expect(result.modification?.success).toBe(true);
    expect(result.modification?.kind).toBe(
      WorkoutModificationKinds.EQUIPMENT_UNAVAILABLE,
    );
    expect(
      result.workoutPlan?.constraints.athleteConstraints.some((item) =>
        item.includes("equipment_unavailable"),
      ),
    ).toBe(true);
    expect(result.message).toMatch(/equipment|unavailable|adapted/i);
  });

  it("applies injury limitations", async () => {
    const service = createTestCoachConversationService();
    const plan = await generateAndAttachPlan(service);

    const result = processCoachConversationTurn({
      service,
      request: createCoachConversationRequest({
        id: "coach-conv-req:injury",
        message: "I hurt my shoulder — adapt the workout for this injury",
      }),
    });

    expect(result.modification?.success).toBe(true);
    expect(result.modification?.kind).toBe(
      WorkoutModificationKinds.INJURY_LIMITATION,
    );
    expect(result.workoutPlan!.metrics.intensityScore).toBeLessThanOrEqual(
      plan.metrics.intensityScore,
    );
    expect(result.message).toMatch(/injury|shoulder|reduced/i);
  });

  it("applies fatigue adaptations", async () => {
    const service = createTestCoachConversationService();
    const plan = await generateAndAttachPlan(service);

    const result = processCoachConversationTurn({
      service,
      request: createCoachConversationRequest({
        id: "coach-conv-req:fatigue",
        message: "I'm fatigued — adjust my workout volume",
      }),
    });

    expect(result.modification?.success).toBe(true);
    expect(result.modification?.kind).toBe(
      WorkoutModificationKinds.FATIGUE_ADJUSTMENT,
    );
    expect(result.workoutPlan!.metrics.volumeScore).toBeLessThanOrEqual(
      plan.metrics.volumeScore,
    );
    expect(result.message).toMatch(/fatigue|volume|intensity/i);
  });

  it("applies duration adaptations", async () => {
    const service = createTestCoachConversationService();
    const plan = await generateAndAttachPlan(service);

    const result = processCoachConversationTurn({
      service,
      request: createCoachConversationRequest({
        id: "coach-conv-req:duration",
        message: "Reduce the workout duration — I have less time today",
      }),
    });

    expect(result.modification?.success).toBe(true);
    expect(result.modification?.kind).toBe(
      WorkoutModificationKinds.REDUCE_DURATION,
    );
    expect(
      result.workoutPlan!.metrics.estimatedDurationSeconds,
    ).toBeLessThanOrEqual(plan.metrics.estimatedDurationSeconds);
  });

  it("keeps conversation continuity on the updated plan", async () => {
    const service = createTestCoachConversationService();
    await generateAndAttachPlan(service);

    const modified = processCoachConversationTurn({
      service,
      request: createCoachConversationRequest({
        id: "coach-conv-req:continuity-mod",
        message: "Reduce the intensity of today's workout",
      }),
    });
    expect(modified.modification?.success).toBe(true);
    const planId = modified.workoutPlan!.id;

    const followUp = processCoachConversationTurn({
      service,
      request: createCoachConversationRequest({
        id: "coach-conv-req:continuity-explain",
        message: "Summarize my workout plan",
        sessionId: modified.sessionId,
      }),
    });

    expect(followUp.success).toBe(true);
    expect(followUp.workoutPlan?.id).toBe(planId);
    expect(followUp.response?.referencesWorkoutPlan).toBe(true);
    expect(followUp.message).toContain(followUp.workoutPlan!.summary.title);
  });

  it("validates modified WorkoutPlans", async () => {
    const pipeline = createTestWorkoutGenerationPipelineService();
    const generated = await generateWorkoutPlan({
      service: pipeline,
      request: createPipelineRequest({ id: "pipeline-req:mod-validate" }),
    });
    expect(generated.plan).not.toBeNull();
    const plan = generated.plan!;

    const modification = modifyWorkoutPlan({
      service: pipeline,
      request: Object.freeze({
        id: "mod-req:validate",
        plan,
        athleteId: plan.athleteId,
        conversationId: plan.conversationId,
        sessionId: plan.sessionId,
        message: "Increase workout intensity slightly",
        kindHint: null,
        metadata: EMPTY_PLAN_METADATA,
        createdAt: plan.createdAt,
      }),
    });

    expect(modification.success).toBe(true);
    expect(modification.plan).not.toBeNull();
    expect(modification.validation.valid).toBe(true);

    const revalidated = validateAdaptedWorkoutPlan({
      plan: modification.plan!,
      previous: plan,
    });
    expect(revalidated.valid).toBe(true);
  });

  it("falls back deterministically for unknown adaptive requests", () => {
    expect(routeWorkoutModificationKind("asdf qwerty zxcv")).toBe(
      WorkoutModificationKinds.UNKNOWN,
    );
  });
});
