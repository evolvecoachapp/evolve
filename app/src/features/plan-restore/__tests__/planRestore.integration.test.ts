import {
  PlanChangeReasons,
  PlanTypes,
  PlanRestoreTargetKinds,
  createNutritionPlanFixture,
  createRestoreClock,
  createRestoreRequest,
  createRestoreTarget,
  createTestPlanRestoreStack,
  createWorkoutPlanFixture,
} from "../testSupport/fixtures";
import { previewRestore } from "../services/previewRestore";
import { resolveRestoreTarget } from "../services/resolveRestoreTarget";
import { validateRestore } from "../services/validateRestore";
import { RestoreConflictCodes } from "../models/RestoreConflict";
import { restorePlan } from "../application";

describe("Plan restore integration", () => {
  it("restores previous workout version as a brand new version", async () => {
    const clock = createRestoreClock();
    const { planHistory, planRestore } = createTestPlanRestoreStack(clock.now);
    const planV1 = await createWorkoutPlanFixture();
    const lineageId = "lineage:workout:prev";

    planHistory.publishVersion(
      Object.freeze({
        id: "pub:1",
        lineageId,
        planType: PlanTypes.WORKOUT,
        athleteId: "athlete:1",
        conversationId: "conversation:1",
        sessionId: null,
        changeReason: PlanChangeReasons.INITIAL,
        changeSummary: "Initial workout",
        workoutPlan: planV1,
        nutritionPlan: null,
        createdAt: clock.now(),
      }),
    );
    clock.advance(60_000);

    const planV2 = Object.freeze({
      ...planV1,
      id: `${planV1.id}:mod:2`,
      metrics: Object.freeze({
        ...planV1.metrics,
        exerciseCount: planV1.metrics.exerciseCount + 1,
      }),
      summary: Object.freeze({
        ...planV1.summary,
        exerciseCount: planV1.summary.exerciseCount + 1,
        message: "Modified workout",
      }),
      frozenAt: clock.now(),
    });
    planHistory.publishVersion(
      Object.freeze({
        id: "pub:2",
        lineageId,
        planType: PlanTypes.WORKOUT,
        athleteId: "athlete:1",
        conversationId: "conversation:1",
        sessionId: null,
        changeReason: PlanChangeReasons.MODIFIED,
        changeSummary: "Added accessory work",
        workoutPlan: planV2,
        nutritionPlan: null,
        createdAt: clock.now(),
      }),
    );
    clock.advance(60_000);

    const result = planRestore.restore(
      createRestoreRequest({
        id: "restore:prev",
        message: "Undo my last workout change",
        target: createRestoreTarget({
          lineageId,
          kind: PlanRestoreTargetKinds.PREVIOUS_VERSION,
        }),
        createdAt: clock.now(),
      }),
    );

    expect(result.success).toBe(true);
    expect(result.publishedVersion?.versionNumber).toBe(3);
    expect(result.workoutPlan?.metrics.exerciseCount).toBe(
      planV1.metrics.exerciseCount,
    );
    expect(planHistory.getHistory(lineageId)?.versions).toHaveLength(3);
    expect(planHistory.getSnapshot(lineageId, 1)?.workoutPlan?.id).toBe(
      planV1.id,
    );
    expect(planHistory.getSnapshot(lineageId, 2)?.workoutPlan?.id).toBe(
      planV2.id,
    );
  });

  it("restores initial workout version", async () => {
    const clock = createRestoreClock();
    const { planHistory, planRestore } = createTestPlanRestoreStack(clock.now);
    const planV1 = await createWorkoutPlanFixture();
    const lineageId = "lineage:workout:initial";

    planHistory.publishVersion(
      Object.freeze({
        id: "pub:1",
        lineageId,
        planType: PlanTypes.WORKOUT,
        athleteId: "athlete:1",
        conversationId: null,
        sessionId: null,
        changeReason: PlanChangeReasons.INITIAL,
        changeSummary: "Initial",
        workoutPlan: planV1,
        nutritionPlan: null,
        createdAt: clock.now(),
      }),
    );
    clock.advance(1_000);
    planHistory.publishVersion(
      Object.freeze({
        id: "pub:2",
        lineageId,
        planType: PlanTypes.WORKOUT,
        athleteId: "athlete:1",
        conversationId: null,
        sessionId: null,
        changeReason: PlanChangeReasons.MODIFIED,
        changeSummary: "Change A",
        workoutPlan: Object.freeze({
          ...planV1,
          id: `${planV1.id}:a`,
          frozenAt: clock.now(),
        }),
        nutritionPlan: null,
        createdAt: clock.now(),
      }),
    );
    clock.advance(1_000);
    planHistory.publishVersion(
      Object.freeze({
        id: "pub:3",
        lineageId,
        planType: PlanTypes.WORKOUT,
        athleteId: "athlete:1",
        conversationId: null,
        sessionId: null,
        changeReason: PlanChangeReasons.MODIFIED,
        changeSummary: "Change B",
        workoutPlan: Object.freeze({
          ...planV1,
          id: `${planV1.id}:b`,
          frozenAt: clock.now(),
        }),
        nutritionPlan: null,
        createdAt: clock.now(),
      }),
    );

    const result = planRestore.restore(
      createRestoreRequest({
        message: "Bring back my original workout",
        target: createRestoreTarget({
          lineageId,
          kind: PlanRestoreTargetKinds.INITIAL_VERSION,
        }),
      }),
    );

    expect(result.success).toBe(true);
    expect(result.publishedVersion?.versionNumber).toBe(4);
    expect(result.preview?.targetVersion.versionNumber).toBe(1);
    expect(result.revertedSummary).toMatch(/v2|v3/i);
  });

  it("restores by version number", async () => {
    const { planHistory, planRestore } = createTestPlanRestoreStack();
    const planV1 = await createWorkoutPlanFixture();
    const lineageId = "lineage:workout:number";

    for (let i = 1; i <= 3; i += 1) {
      planHistory.publishVersion(
        Object.freeze({
          id: `pub:${i}`,
          lineageId,
          planType: PlanTypes.WORKOUT,
          athleteId: "athlete:1",
          conversationId: null,
          sessionId: null,
          changeReason:
            i === 1 ? PlanChangeReasons.INITIAL : PlanChangeReasons.MODIFIED,
          changeSummary: `Version ${i}`,
          workoutPlan: Object.freeze({
            ...planV1,
            id: `${planV1.id}:v${i}`,
            frozenAt: FIXED_GENERATION_SAFE(i),
          }),
          nutritionPlan: null,
          createdAt: FIXED_GENERATION_SAFE(i),
        }),
      );
    }

    const result = planRestore.restore(
      createRestoreRequest({
        message: "Restore version 2",
        target: createRestoreTarget({
          lineageId,
          kind: PlanRestoreTargetKinds.VERSION_NUMBER,
          versionNumber: 2,
        }),
      }),
    );

    expect(result.success).toBe(true);
    expect(result.preview?.targetVersion.versionNumber).toBe(2);
    expect(result.publishedVersion?.versionNumber).toBe(4);
  });

  it("restores by timestamp", async () => {
    const clock = createRestoreClock("2026-07-25T10:00:00.000Z");
    const { planHistory, planRestore } = createTestPlanRestoreStack(clock.now);
    const planV1 = await createWorkoutPlanFixture();
    const lineageId = "lineage:workout:ts";

    planHistory.publishVersion(
      Object.freeze({
        id: "pub:1",
        lineageId,
        planType: PlanTypes.WORKOUT,
        athleteId: "athlete:1",
        conversationId: null,
        sessionId: null,
        changeReason: PlanChangeReasons.INITIAL,
        changeSummary: "Morning plan",
        workoutPlan: planV1,
        nutritionPlan: null,
        createdAt: clock.now(),
      }),
    );
    clock.advance(24 * 60 * 60 * 1000);
    planHistory.publishVersion(
      Object.freeze({
        id: "pub:2",
        lineageId,
        planType: PlanTypes.WORKOUT,
        athleteId: "athlete:1",
        conversationId: null,
        sessionId: null,
        changeReason: PlanChangeReasons.MODIFIED,
        changeSummary: "Next day plan",
        workoutPlan: Object.freeze({
          ...planV1,
          id: `${planV1.id}:next`,
          frozenAt: clock.now(),
        }),
        nutritionPlan: null,
        createdAt: clock.now(),
      }),
    );

    const result = planRestore.restore(
      createRestoreRequest({
        message: "Restore yesterday's workout",
        target: createRestoreTarget({
          lineageId,
          kind: PlanRestoreTargetKinds.TIMESTAMP,
          timestamp: "2026-07-25T23:59:59.000Z",
        }),
      }),
    );

    expect(result.success).toBe(true);
    expect(result.preview?.targetVersion.versionNumber).toBe(1);
  });

  it("restores by change reason", async () => {
    const { planHistory, planRestore } = createTestPlanRestoreStack();
    const planV1 = await createWorkoutPlanFixture();
    const lineageId = "lineage:workout:reason";

    planHistory.publishVersion(
      Object.freeze({
        id: "pub:1",
        lineageId,
        planType: PlanTypes.WORKOUT,
        athleteId: "athlete:1",
        conversationId: null,
        sessionId: null,
        changeReason: PlanChangeReasons.INITIAL,
        changeSummary: "Initial",
        workoutPlan: planV1,
        nutritionPlan: null,
        createdAt: "2026-07-27T10:00:00.000Z",
      }),
    );
    planHistory.publishVersion(
      Object.freeze({
        id: "pub:2",
        lineageId,
        planType: PlanTypes.WORKOUT,
        athleteId: "athlete:1",
        conversationId: null,
        sessionId: null,
        changeReason: PlanChangeReasons.ADAPTED,
        changeSummary: "Adapted for fatigue",
        workoutPlan: Object.freeze({
          ...planV1,
          id: `${planV1.id}:adapted`,
          frozenAt: "2026-07-27T11:00:00.000Z",
        }),
        nutritionPlan: null,
        createdAt: "2026-07-27T11:00:00.000Z",
      }),
    );
    planHistory.publishVersion(
      Object.freeze({
        id: "pub:3",
        lineageId,
        planType: PlanTypes.WORKOUT,
        athleteId: "athlete:1",
        conversationId: null,
        sessionId: null,
        changeReason: PlanChangeReasons.MODIFIED,
        changeSummary: "Later tweak",
        workoutPlan: Object.freeze({
          ...planV1,
          id: `${planV1.id}:mod`,
          frozenAt: "2026-07-27T12:00:00.000Z",
        }),
        nutritionPlan: null,
        createdAt: "2026-07-27T12:00:00.000Z",
      }),
    );

    const result = planRestore.restore(
      createRestoreRequest({
        message: "Restore the adapted version",
        target: createRestoreTarget({
          lineageId,
          kind: PlanRestoreTargetKinds.CHANGE_REASON,
          changeReason: PlanChangeReasons.ADAPTED,
        }),
      }),
    );

    expect(result.success).toBe(true);
    expect(result.preview?.targetVersion.changeReason).toBe(
      PlanChangeReasons.ADAPTED,
    );
    expect(result.publishedVersion?.changeReason).toBe(
      PlanChangeReasons.RESTORED,
    );
  });

  it("generates restore preview without publishing", async () => {
    const { planHistory, planRestore } = createTestPlanRestoreStack();
    const planV1 = await createWorkoutPlanFixture();
    const lineageId = "lineage:workout:preview";

    planHistory.publishVersion(
      Object.freeze({
        id: "pub:1",
        lineageId,
        planType: PlanTypes.WORKOUT,
        athleteId: "athlete:1",
        conversationId: null,
        sessionId: null,
        changeReason: PlanChangeReasons.INITIAL,
        changeSummary: "Initial",
        workoutPlan: planV1,
        nutritionPlan: null,
        createdAt: "2026-07-27T10:00:00.000Z",
      }),
    );
    planHistory.publishVersion(
      Object.freeze({
        id: "pub:2",
        lineageId,
        planType: PlanTypes.WORKOUT,
        athleteId: "athlete:1",
        conversationId: null,
        sessionId: null,
        changeReason: PlanChangeReasons.MODIFIED,
        changeSummary: "Modified",
        workoutPlan: Object.freeze({
          ...planV1,
          id: `${planV1.id}:mod`,
          frozenAt: "2026-07-27T11:00:00.000Z",
        }),
        nutritionPlan: null,
        createdAt: "2026-07-27T11:00:00.000Z",
      }),
    );

    const request = createRestoreRequest({
      target: createRestoreTarget({
        lineageId,
        kind: PlanRestoreTargetKinds.PREVIOUS_VERSION,
      }),
    });
    const previewed = planRestore.previewOnly(request);
    expect(previewed.success).toBe(true);
    expect(previewed.preview?.currentVersion.versionNumber).toBe(2);
    expect(previewed.preview?.targetVersion.versionNumber).toBe(1);
    expect(previewed.preview?.discardedChangesSummary.length).toBeGreaterThan(
      0,
    );
    expect(planHistory.getHistory(lineageId)?.currentVersionNumber).toBe(2);

    const history = planHistory.getHistory(lineageId)!;
    const resolved = resolveRestoreTarget({
      history,
      target: request.target,
    });
    const domainPreview = previewRestore({
      id: "preview:direct",
      request,
      history,
      targetSnapshot: resolved.snapshot!,
      createdAt: "2026-07-27T12:00:00.000Z",
    });
    expect(domainPreview.recoveredChangesSummary.length).toBeGreaterThan(0);
  });

  it("returns deterministic validation failures for unknown targets", () => {
    const { planRestore } = createTestPlanRestoreStack();
    const result = planRestore.restore(
      createRestoreRequest({
        target: createRestoreTarget({
          lineageId: "missing",
          kind: PlanRestoreTargetKinds.VERSION_NUMBER,
          versionNumber: null,
        }),
      }),
    );
    expect(result.success).toBe(false);
    expect(result.conflicts[0]?.code).toBe(
      RestoreConflictCodes.HISTORY_NOT_FOUND,
    );
  });

  it("rejects corrupted snapshots", async () => {
    const { planHistory, planRestore } = createTestPlanRestoreStack();
    const planV1 = await createWorkoutPlanFixture();
    const lineageId = "lineage:workout:corrupt";

    planHistory.publishVersion(
      Object.freeze({
        id: "pub:1",
        lineageId,
        planType: PlanTypes.WORKOUT,
        athleteId: "athlete:1",
        conversationId: null,
        sessionId: null,
        changeReason: PlanChangeReasons.INITIAL,
        changeSummary: "Initial",
        workoutPlan: planV1,
        nutritionPlan: null,
        createdAt: "2026-07-27T10:00:00.000Z",
      }),
    );
    planHistory.publishVersion(
      Object.freeze({
        id: "pub:2",
        lineageId,
        planType: PlanTypes.WORKOUT,
        athleteId: "athlete:1",
        conversationId: null,
        sessionId: null,
        changeReason: PlanChangeReasons.MODIFIED,
        changeSummary: "Corrupt candidate",
        workoutPlan: Object.freeze({
          ...planV1,
          id: `${planV1.id}:corrupt`,
          frozenAt: "2026-07-27T11:00:00.000Z",
        }),
        nutritionPlan: null,
        markCorrupted: true,
        createdAt: "2026-07-27T11:00:00.000Z",
      }),
    );
    planHistory.publishVersion(
      Object.freeze({
        id: "pub:3",
        lineageId,
        planType: PlanTypes.WORKOUT,
        athleteId: "athlete:1",
        conversationId: null,
        sessionId: null,
        changeReason: PlanChangeReasons.MODIFIED,
        changeSummary: "Later",
        workoutPlan: Object.freeze({
          ...planV1,
          id: `${planV1.id}:later`,
          frozenAt: "2026-07-27T12:00:00.000Z",
        }),
        nutritionPlan: null,
        createdAt: "2026-07-27T12:00:00.000Z",
      }),
    );

    const result = planRestore.restore(
      createRestoreRequest({
        target: createRestoreTarget({
          lineageId,
          kind: PlanRestoreTargetKinds.VERSION_NUMBER,
          versionNumber: 2,
        }),
      }),
    );

    expect(result.success).toBe(false);
    expect(result.conflicts.some((c) => c.code === RestoreConflictCodes.SNAPSHOT_CORRUPTED)).toBe(
      true,
    );
    expect(planHistory.getHistory(lineageId)?.currentVersionNumber).toBe(3);
  });

  it("keeps history consistent across sequential restores", async () => {
    const clock = createRestoreClock();
    const { planHistory, planRestore } = createTestPlanRestoreStack(clock.now);
    const planV1 = await createWorkoutPlanFixture();
    const lineageId = "lineage:workout:seq";

    planHistory.publishVersion(
      Object.freeze({
        id: "pub:1",
        lineageId,
        planType: PlanTypes.WORKOUT,
        athleteId: "athlete:1",
        conversationId: null,
        sessionId: null,
        changeReason: PlanChangeReasons.INITIAL,
        changeSummary: "Initial",
        workoutPlan: planV1,
        nutritionPlan: null,
        createdAt: clock.now(),
      }),
    );
    clock.advance(1000);
    planHistory.publishVersion(
      Object.freeze({
        id: "pub:2",
        lineageId,
        planType: PlanTypes.WORKOUT,
        athleteId: "athlete:1",
        conversationId: null,
        sessionId: null,
        changeReason: PlanChangeReasons.MODIFIED,
        changeSummary: "Mod",
        workoutPlan: Object.freeze({
          ...planV1,
          id: `${planV1.id}:mod`,
          frozenAt: clock.now(),
        }),
        nutritionPlan: null,
        createdAt: clock.now(),
      }),
    );

    const first = planRestore.restore(
      createRestoreRequest({
        id: "restore:1",
        target: createRestoreTarget({
          lineageId,
          kind: PlanRestoreTargetKinds.INITIAL_VERSION,
        }),
      }),
    );
    expect(first.success).toBe(true);
    expect(first.publishedVersion?.versionNumber).toBe(3);

    const second = planRestore.restore(
      createRestoreRequest({
        id: "restore:2",
        target: createRestoreTarget({
          lineageId,
          kind: PlanRestoreTargetKinds.VERSION_NUMBER,
          versionNumber: 2,
        }),
      }),
    );
    expect(second.success).toBe(true);
    expect(second.publishedVersion?.versionNumber).toBe(4);

    const history = planHistory.getHistory(lineageId)!;
    expect(history.versions.map((v) => v.versionNumber)).toEqual([1, 2, 3, 4]);
    const { validation } = validateRestore({
      history,
      snapshot: history.snapshots[0]!,
      expectedPlanType: PlanTypes.WORKOUT,
      historyService: planHistory,
    });
    expect(validation.historyConsistency).toBe(true);
  });

  it("restores nutrition plans through the same pipeline", () => {
    const clock = createRestoreClock();
    const { planHistory, planRestore } = createTestPlanRestoreStack(clock.now);
    const lineageId = "lineage:nutrition:1";
    const dietV1 = createNutritionPlanFixture({
      id: "nutrition:v1",
      calorieTargets: Object.freeze({
        tdeeEstimate: 2500,
        targetCalories: 2000,
        deficitOrSurplus: -500,
      }),
    });
    const dietV2 = createNutritionPlanFixture({
      id: "nutrition:v2",
      calorieTargets: Object.freeze({
        tdeeEstimate: 2500,
        targetCalories: 2200,
        deficitOrSurplus: -300,
      }),
      createdAt: "2026-07-27T11:00:00.000Z",
    });

    planHistory.publishVersion(
      Object.freeze({
        id: "pub:n1",
        lineageId,
        planType: PlanTypes.NUTRITION,
        athleteId: "athlete:1",
        conversationId: null,
        sessionId: null,
        changeReason: PlanChangeReasons.INITIAL,
        changeSummary: "Original diet",
        workoutPlan: null,
        nutritionPlan: dietV1,
        createdAt: clock.now(),
      }),
    );
    clock.advance(60_000);
    planHistory.publishVersion(
      Object.freeze({
        id: "pub:n2",
        lineageId,
        planType: PlanTypes.NUTRITION,
        athleteId: "athlete:1",
        conversationId: null,
        sessionId: null,
        changeReason: PlanChangeReasons.MODIFIED,
        changeSummary: "Raised calories",
        workoutPlan: null,
        nutritionPlan: dietV2,
        createdAt: clock.now(),
      }),
    );

    const result = restorePlan({
      service: planRestore,
      request: createRestoreRequest({
        message: "Bring back my original diet",
        target: createRestoreTarget({
          lineageId,
          planType: PlanTypes.NUTRITION,
          kind: PlanRestoreTargetKinds.INITIAL_VERSION,
        }),
      }),
    });

    expect(result.success).toBe(true);
    expect(result.nutritionPlan?.calorieTargets.targetCalories).toBe(2000);
    expect(result.publishedVersion?.versionNumber).toBe(3);
    expect(result.workoutPlan).toBeNull();
  });

  it("supports manual selection restore", async () => {
    const { planHistory, planRestore } = createTestPlanRestoreStack();
    const planV1 = await createWorkoutPlanFixture();
    const lineageId = "lineage:workout:manual";

    const snap1 = planHistory.publishVersion(
      Object.freeze({
        id: "pub:1",
        lineageId,
        planType: PlanTypes.WORKOUT,
        athleteId: "athlete:1",
        conversationId: null,
        sessionId: null,
        changeReason: PlanChangeReasons.INITIAL,
        changeSummary: "Initial",
        workoutPlan: planV1,
        nutritionPlan: null,
        createdAt: "2026-07-27T10:00:00.000Z",
      }),
    );
    planHistory.publishVersion(
      Object.freeze({
        id: "pub:2",
        lineageId,
        planType: PlanTypes.WORKOUT,
        athleteId: "athlete:1",
        conversationId: null,
        sessionId: null,
        changeReason: PlanChangeReasons.MODIFIED,
        changeSummary: "Modified",
        workoutPlan: Object.freeze({
          ...planV1,
          id: `${planV1.id}:mod`,
          frozenAt: "2026-07-27T11:00:00.000Z",
        }),
        nutritionPlan: null,
        createdAt: "2026-07-27T11:00:00.000Z",
      }),
    );

    const result = planRestore.restore(
      createRestoreRequest({
        target: createRestoreTarget({
          lineageId,
          kind: PlanRestoreTargetKinds.MANUAL_SELECTION,
          snapshotId: snap1.id,
        }),
      }),
    );

    expect(result.success).toBe(true);
    expect(result.preview?.targetSnapshot.id).toBe(snap1.id);
  });
});

function FIXED_GENERATION_SAFE(index: number): string {
  return `2026-07-27T10:0${index}:00.000Z`;
}
