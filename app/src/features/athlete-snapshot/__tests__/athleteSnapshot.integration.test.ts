import { CoachTimelineEventCategories } from "../../coach-timeline/models/CoachTimelineEvent";
import { createTestCoachTimelineService } from "../../coach-timeline/testSupport/fixtures";
import {
  createCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import { appendSeedEntry } from "../../proactive-insights/testSupport/fixtures";
import {
  buildAthleteSnapshot,
  buildCoachProjection,
  buildEvidence,
  buildIdentity,
  buildMetadata,
  buildState,
  buildTimelineProjection,
  buildVersion,
  composeAthleteSnapshot,
  getCurrentSnapshot,
  getSnapshotCoach,
  getSnapshotIdentity,
  getSnapshotState,
  getSnapshotTimeline,
  getSnapshotWorkspace,
  validateAthleteSnapshotForAthlete,
  validateIntegrity,
  validateSnapshot,
} from "../index";
import {
  createStubAthleteState,
  createStubCoachingSession,
  createStubGoalProgress,
  createStubInsight,
  createStubNutritionPlan,
  createStubPlanHistory,
  createStubRecoveryMetrics,
  createStubSleepProfile,
  createStubWorkoutPlan,
  createTestAthleteSnapshotService,
  FIXED_SNAPSHOT_TIMESTAMP,
} from "../testSupport/fixtures";
import { createExplainableCoachingSessionService } from "../../coaching-session/composition/services/ExplainableCoachingSessionService";
import { createTestHomeExperienceService } from "../../home-experience/testSupport/fixtures";
import { createTestDailyBriefService } from "../../daily-brief/testSupport/fixtures";
import { createTestWeeklyCoachReportService } from "../../weekly-report/testSupport/fixtures";
import { createAthleteWorkspaceService } from "../../intelligence-workspace/services/AthleteWorkspaceService";
import { createAthleteSnapshotService } from "../services/AthleteSnapshotService";

describe("Athlete Snapshot integration (Sprint 28.2)", () => {
  const createEvidenceSession = () =>
    Object.freeze({
      ...createStubCoachingSession(),
      evidenceUsed: Object.freeze({
        items: Object.freeze([
          Object.freeze({
            id: "evidence:1",
            source: "coach_timeline",
            key: "timeline:1",
            summary: "Timeline decision reference",
            referenceId: "decision:1",
          }),
        ]),
        sources: Object.freeze(["coach_timeline"] as const),
        timelineEntryIds: Object.freeze(["decision:1"]),
        planVersionNumbers: Object.freeze([3]),
        decisionIds: Object.freeze(["decision:1"]),
        recommendationIds: Object.freeze(["rec:1"]),
        explanationIds: Object.freeze([]),
        insightIds: Object.freeze([]),
        keys: Object.freeze(["timeline:1"]),
        summary: "1 evidence item",
      }),
      confidence: Object.freeze({
        level: "high",
        score: 0.9,
        evidenceCount: 1,
        sourceCount: 1,
        rationale: "Timeline evidence present",
      }),
    });

  afterEach(() => {
    resetCompositionRoot();
  });

  it("builds snapshot identity deterministically", () => {
    const identity = buildIdentity({
      athleteId: "athlete:1",
      createdAt: FIXED_SNAPSHOT_TIMESTAMP,
    });

    expect(identity.athleteId).toBe("athlete:1");
    expect(identity.snapshotId).toBe(
      `athlete-snapshot:athlete:1:${FIXED_SNAPSHOT_TIMESTAMP}`,
    );
    expect(identity.createdAt).toBe(FIXED_SNAPSHOT_TIMESTAMP);
  });

  it("builds snapshot state from athlete state and goal progress", () => {
    const state = buildState({
      athleteId: "athlete:1",
      athleteState: createStubAthleteState(),
      goalProgress: createStubGoalProgress(),
    });

    expect(state.currentPhase).toBe("Strength Block");
    expect(state.goalCategory).toBeDefined();
    expect(state.recoveryState).toBe("stable");
    expect(state.athleteStatus).toBe("active");
  });

  it("projects workspace without transformation", () => {
    const workspace = Object.freeze({
      id: "athlete-workspace:athlete:1:1",
      athleteId: "athlete:1",
      overview: Object.freeze({ athleteId: "athlete:1" }),
      status: Object.freeze({ athleteId: "athlete:1" }),
      home: Object.freeze({ present: true }),
      dailyBrief: Object.freeze({ present: true }),
      weeklyReport: Object.freeze({ present: true }),
      timeline: Object.freeze({ athleteId: "athlete:1" }),
      insights: Object.freeze({ athleteId: "athlete:1" }),
      coach: Object.freeze({ athleteId: "athlete:1" }),
      metadata: Object.freeze({
        generatedAt: FIXED_SNAPSHOT_TIMESTAMP,
        version: "28.1",
        workspaceId: "athlete-workspace:athlete:1:1",
        weekStart: "2026-07-22T12:00:00.000Z",
        weekEnd: FIXED_SNAPSHOT_TIMESTAMP,
      }),
    }) as never;

    const projection = buildAthleteSnapshot({
      athleteId: "athlete:1",
      createdAt: FIXED_SNAPSHOT_TIMESTAMP,
      athleteState: createStubAthleteState(),
      goalProgress: createStubGoalProgress(),
      workspace,
      timeline: Object.freeze({
        athleteId: "athlete:1",
        entries: Object.freeze([]),
        entryCount: 0,
        createdAt: FIXED_SNAPSHOT_TIMESTAMP,
        updatedAt: FIXED_SNAPSHOT_TIMESTAMP,
      }),
      coachingSession: createStubCoachingSession(),
    });

    expect(projection.success).toBe(true);
    expect(projection.snapshot?.workspace.workspace).toBe(workspace);
  });

  it("projects timeline latest events, decisions, and restores", () => {
    const timeline = createTestCoachTimelineService();
    appendSeedEntry(timeline, {
      id: "decision:1",
      category: CoachTimelineEventCategories.COACH_DECISION,
      summary: "Hold intensity",
      affectedDomain: "decision",
    });
    appendSeedEntry(timeline, {
      id: "restore:1",
      category: CoachTimelineEventCategories.WORKOUT_RESTORED,
      summary: "Restore prior plan",
      affectedDomain: "workout",
    });

    const projection = buildTimelineProjection({
      athleteId: "athlete:1",
      timeline: timeline.getTimeline("athlete:1"),
    });

    expect(projection.present).toBe(true);
    expect(projection.latestEvents.length).toBe(2);
    expect(projection.latestDecisions[0]?.id).toBe("decision:1");
    expect(projection.latestRestores[0]?.id).toBe("restore:1");
  });

  it("projects coach recommendation, confidence, and evidence", () => {
    const projection = buildCoachProjection({
      athleteId: "athlete:1",
      coachingSession: createEvidenceSession(),
    });

    expect(projection.present).toBe(true);
    expect(projection.recommendation).toContain("Hold intensity");
    expect(projection.confidence).toBeGreaterThan(0);
    expect(projection.evidence?.items.length).toBeGreaterThan(0);
  });

  it("builds evidence references only from composed artifacts", () => {
    const timeline = createTestCoachTimelineService();
    appendSeedEntry(timeline, {
      id: "decision:evidence",
      category: CoachTimelineEventCategories.COACH_DECISION,
      summary: "Protect recovery",
      affectedDomain: "decision",
    });
    const coach = buildCoachProjection({
      athleteId: "athlete:1",
      coachingSession: createEvidenceSession(),
    });
    const evidence = buildEvidence({
      athleteId: "athlete:1",
      workspace: Object.freeze({
        athleteId: "athlete:1",
        present: true,
        workspace: Object.freeze({ id: "workspace:1" }) as never,
        workspaceId: "workspace:1",
      }),
      timeline: buildTimelineProjection({
        athleteId: "athlete:1",
        timeline: timeline.getTimeline("athlete:1"),
      }),
      coach,
    });

    expect(evidence.workspaceId).toBe("workspace:1");
    expect(evidence.timelineEntryIds).toContain("decision:evidence");
    expect(evidence.coachingEvidenceItemIds.length).toBeGreaterThan(0);
    expect(evidence.coachingEvidenceKeys.length).toBeGreaterThan(0);
  });

  it("builds metadata and version from existing artifacts", () => {
    const weeklyReport = Object.freeze({
      weekStart: "2026-07-22T12:00:00.000Z",
      weekEnd: FIXED_SNAPSHOT_TIMESTAMP,
    }) as never;
    const metadata = buildMetadata({
      generatedAt: FIXED_SNAPSHOT_TIMESTAMP,
      weeklyReport,
      applicationVersion: "28.2",
      schemaVersion: "1.0",
    });
    const version = buildVersion({
      snapshotVersion: "28.2",
      workspace: Object.freeze({
        metadata: Object.freeze({ version: "28.1" }),
      }) as never,
      timeline: Object.freeze({
        updatedAt: FIXED_SNAPSHOT_TIMESTAMP,
      }) as never,
      coachingSession: createStubCoachingSession(),
    });

    expect(metadata.generatedAt).toBe(FIXED_SNAPSHOT_TIMESTAMP);
    expect(metadata.weekStart).toBe("2026-07-22T12:00:00.000Z");
    expect(version.snapshotVersion).toBe("28.2");
    expect(version.workspaceVersion).toBe("28.1");
    expect(version.timelineVersion).toBe(FIXED_SNAPSHOT_TIMESTAMP);
  });

  it("exposes dashboard APIs after composition", () => {
    const service = createTestAthleteSnapshotService();
    const timeline = createTestCoachTimelineService();
    appendSeedEntry(timeline, {
      id: "decision:dash",
      category: CoachTimelineEventCategories.COACH_DECISION,
      summary: "Keep plan steady",
      affectedDomain: "decision",
    });

    const composed = composeAthleteSnapshot({
      service,
      input: {
        athleteId: "athlete:1",
        athleteState: createStubAthleteState(),
        goalProgress: createStubGoalProgress(),
        workspace: Object.freeze({
          id: "workspace:dash",
          athleteId: "athlete:1",
          overview: Object.freeze({ athleteId: "athlete:1" }),
          status: Object.freeze({ athleteId: "athlete:1" }),
          home: Object.freeze({ present: true }),
          dailyBrief: Object.freeze({ present: true }),
          weeklyReport: Object.freeze({ present: true }),
          timeline: Object.freeze({ athleteId: "athlete:1" }),
          insights: Object.freeze({ athleteId: "athlete:1" }),
          coach: Object.freeze({ athleteId: "athlete:1" }),
          metadata: Object.freeze({
            generatedAt: FIXED_SNAPSHOT_TIMESTAMP,
            version: "28.1",
            workspaceId: "workspace:dash",
            weekStart: "2026-07-22T12:00:00.000Z",
            weekEnd: FIXED_SNAPSHOT_TIMESTAMP,
          }),
        }) as never,
        timeline: timeline.getTimeline("athlete:1"),
        coachingSession: createStubCoachingSession(),
      },
    });

    expect(composed.success).toBe(true);
    expect(getCurrentSnapshot({ athleteId: "athlete:1", service })).not.toBeNull();
    expect(getSnapshotIdentity({ athleteId: "athlete:1", service })?.athleteId).toBe(
      "athlete:1",
    );
    expect(getSnapshotState({ athleteId: "athlete:1", service })?.currentPhase).toBe(
      "Strength Block",
    );
    expect(getSnapshotWorkspace({ athleteId: "athlete:1", service })?.workspaceId).toBe(
      "workspace:dash",
    );
    expect(getSnapshotTimeline({ athleteId: "athlete:1", service })?.present).toBe(
      true,
    );
    expect(getSnapshotCoach({ athleteId: "athlete:1", service })?.present).toBe(true);
  });

  it("reports validation failures for incomplete snapshots", () => {
    expect(validateIntegrity(null).valid).toBe(false);
    expect(validateIntegrity(null).errors).toContain("Athlete snapshot is missing");

    const invalid = buildAthleteSnapshot({
      athleteId: "athlete:missing",
      createdAt: FIXED_SNAPSHOT_TIMESTAMP,
      athleteState: createStubAthleteState({ athleteId: "athlete:missing" }),
      goalProgress: createStubGoalProgress(),
      workspace: null,
      timeline: null,
      coachingSession: null,
    });
    expect(invalid.success).toBe(false);

    const service = createTestAthleteSnapshotService();
    expect(
      validateAthleteSnapshotForAthlete({
        athleteId: "athlete:missing",
        service,
      }).valid,
    ).toBe(false);
  });

  it("freezes immutable snapshot models", () => {
    const result = buildAthleteSnapshot({
      athleteId: "athlete:1",
      createdAt: FIXED_SNAPSHOT_TIMESTAMP,
      athleteState: createStubAthleteState(),
      goalProgress: createStubGoalProgress(),
      workspace: Object.freeze({
        id: "workspace:immutable",
        athleteId: "athlete:1",
        overview: Object.freeze({ athleteId: "athlete:1" }),
        status: Object.freeze({ athleteId: "athlete:1" }),
        home: Object.freeze({ present: true }),
        dailyBrief: Object.freeze({ present: true }),
        weeklyReport: Object.freeze({ present: true }),
        timeline: Object.freeze({ athleteId: "athlete:1" }),
        insights: Object.freeze({ athleteId: "athlete:1" }),
        coach: Object.freeze({ athleteId: "athlete:1" }),
        metadata: Object.freeze({
          generatedAt: FIXED_SNAPSHOT_TIMESTAMP,
          version: "28.1",
          workspaceId: "workspace:immutable",
          weekStart: "2026-07-22T12:00:00.000Z",
          weekEnd: FIXED_SNAPSHOT_TIMESTAMP,
        }),
      }) as never,
      timeline: Object.freeze({
        athleteId: "athlete:1",
        entries: Object.freeze([]),
        entryCount: 0,
        createdAt: FIXED_SNAPSHOT_TIMESTAMP,
        updatedAt: FIXED_SNAPSHOT_TIMESTAMP,
      }),
      coachingSession: createStubCoachingSession(),
    });

    expect(result.success).toBe(true);
    expect(Object.isFrozen(result.snapshot)).toBe(true);
    expect(Object.isFrozen(result.snapshot?.state)).toBe(true);
    expect(Object.isFrozen(result.snapshot?.workspace)).toBe(true);
    expect(Object.isFrozen(result.snapshot?.timeline)).toBe(true);
    expect(Object.isFrozen(result.snapshot?.coach)).toBe(true);
    expect(validateSnapshot(result.snapshot).valid).toBe(true);
  });

  it("composes a complete snapshot from existing coaching artifacts", () => {
    const clock = () => FIXED_SNAPSHOT_TIMESTAMP;
    const coachTimeline = createTestCoachTimelineService();
    appendSeedEntry(coachTimeline, {
      id: "full:decision",
      category: CoachTimelineEventCategories.COACH_DECISION,
      summary: "Protect recovery",
      affectedDomain: "decision",
    });
    appendSeedEntry(coachTimeline, {
      id: "full:restore",
      category: CoachTimelineEventCategories.WORKOUT_RESTORED,
      summary: "Restored prior plan",
      affectedDomain: "workout",
    });

    const explainable = createExplainableCoachingSessionService({
      coachTimeline,
      clock,
    });
    const homeService = createTestHomeExperienceService({ clock, coachTimeline });
    const dailyService = createTestDailyBriefService({
      clock,
      coachTimeline,
      homeExperience: homeService,
    });
    const weeklyService = createTestWeeklyCoachReportService({ clock });

    homeService.build({
      athleteId: "athlete:1",
      requestId: "req:home",
      workoutPlan: createStubWorkoutPlan(),
      nutritionPlan: createStubNutritionPlan(),
      recoveryMetrics: createStubRecoveryMetrics(),
      sleepProfile: createStubSleepProfile(),
      goalProgress: createStubGoalProgress(),
      coachingSession: createStubCoachingSession(),
      insights: Object.freeze([createStubInsight({ id: "ins:home" })]),
    });
    dailyService.build({
      athleteId: "athlete:1",
      requestId: "req:daily",
      workoutPlan: createStubWorkoutPlan(),
      nutritionPlan: createStubNutritionPlan(),
      recoveryMetrics: createStubRecoveryMetrics(),
      sleepProfile: createStubSleepProfile(),
      goalProgress: createStubGoalProgress(),
      coachingSession: createStubCoachingSession(),
      insights: Object.freeze([createStubInsight({ id: "ins:daily" })]),
    });
    weeklyService.build({
      athleteId: "athlete:1",
      requestId: "req:weekly",
      workoutPlan: createStubWorkoutPlan(),
      nutritionPlan: createStubNutritionPlan(),
      recoveryMetrics: createStubRecoveryMetrics(),
      sleepProfile: createStubSleepProfile(),
      goalProgress: createStubGoalProgress(),
      coachingSession: createStubCoachingSession(),
      insights: Object.freeze([createStubInsight({ id: "ins:weekly" })]),
    });

    const workspaceService = createAthleteWorkspaceService({
      homeExperience: homeService,
      dailyBrief: dailyService,
      weeklyCoachReport: weeklyService,
      coachTimeline,
      explainableCoachingSession: explainable,
      clock,
    });
    workspaceService.build({
      athleteId: "athlete:1",
      requestId: "req:workspace",
      athleteState: createStubAthleteState(),
      goalProgress: createStubGoalProgress(),
      planHistory: createStubPlanHistory(),
      coachingSession: createStubCoachingSession(),
      insights: Object.freeze([createStubInsight({ id: "ins:workspace" })]),
    });

    const snapshotService = createAthleteSnapshotService({
      athleteWorkspace: workspaceService,
      coachTimeline,
      explainableCoachingSession: explainable,
      weeklyCoachReport: weeklyService,
      clock,
    });

    const result = snapshotService.build({
      athleteId: "athlete:1",
      athleteState: createStubAthleteState(),
      goalProgress: createStubGoalProgress(),
      coachingSession: createStubCoachingSession(),
    });

    expect(result.success).toBe(true);
    expect(result.snapshot?.workspace.present).toBe(true);
    expect(result.snapshot?.timeline.latestDecisions.length).toBeGreaterThan(0);
    expect(result.snapshot?.coach.present).toBe(true);
    expect(result.snapshot?.evidence.timelineEntryIds.length).toBeGreaterThan(0);
  });

  it("registers AthleteSnapshotService in Composition Root", () => {
    const root = createCompositionRoot();
    expect(root.resolve("AthleteSnapshotService")).toBeDefined();
    expect(root.getAthleteSnapshotService()).toBe(
      root.resolve("AthleteSnapshotService"),
    );
  });
});
