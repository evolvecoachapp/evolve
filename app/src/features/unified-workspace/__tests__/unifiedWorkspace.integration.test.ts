import { CoachTimelineEventCategories } from "../../coach-timeline/models/CoachTimelineEvent";
import { createTestCoachTimelineService } from "../../coach-timeline/testSupport/fixtures";
import {
  createCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import { appendSeedEntry } from "../../proactive-insights/testSupport/fixtures";
import { createExplainableCoachingSessionService } from "../../coaching-session/composition/services/ExplainableCoachingSessionService";
import { createTestHomeExperienceService } from "../../home-experience/testSupport/fixtures";
import { createTestDailyBriefService } from "../../daily-brief/testSupport/fixtures";
import { createTestWeeklyCoachReportService } from "../../weekly-report/testSupport/fixtures";
import { createAthleteWorkspaceService } from "../../intelligence-workspace/services/AthleteWorkspaceService";
import { createAthleteSnapshotService } from "../../athlete-snapshot/services/AthleteSnapshotService";
import {
  buildUnifiedWorkspace,
  buildWorkspaceCoach,
  buildWorkspaceHealth,
  buildWorkspaceInsights,
  buildWorkspaceSnapshot,
  buildWorkspaceSummary,
  buildWorkspaceTimeline,
  composeUnifiedWorkspace,
  getWorkspace,
  getWorkspaceCoach,
  getWorkspaceHealth,
  getWorkspaceInsights,
  getWorkspaceSummary,
  validateUnifiedWorkspaceForAthlete,
  validateWorkspace,
} from "../index";
import {
  createStubAthleteSnapshot,
  createStubAthleteState,
  createStubCoachingSession,
  createStubGoalProgress,
  createStubInsight,
  createStubNutritionPlan,
  createStubPlanHistory,
  createStubRecoveryMetrics,
  createStubSleepProfile,
  createStubWorkoutPlan,
  createTestUnifiedWorkspaceService,
  FIXED_WORKSPACE_TIMESTAMP,
} from "../testSupport/fixtures";
import { createUnifiedWorkspaceService } from "../services/UnifiedWorkspaceService";

describe("Unified Athlete Workspace integration (Sprint 28.3)", () => {
  afterEach(() => {
    resetCompositionRoot();
  });

  it("builds workspace summary from home, daily, weekly, and snapshot availability", () => {
    const snapshot = createStubAthleteSnapshot();
    const summary = buildWorkspaceSummary({
      athleteId: "athlete:1",
      generatedAt: FIXED_WORKSPACE_TIMESTAMP,
      homeExperience: Object.freeze({
        summary: Object.freeze({
          headline: "Home ready",
          narrative: "Home narrative",
          highlights: Object.freeze(["Home highlight"]),
        }),
      }) as never,
      dailyBrief: Object.freeze({
        summary: Object.freeze({
          headline: "Daily ready",
          narrative: "Daily narrative",
          highlights: Object.freeze(["Daily highlight"]),
        }),
      }) as never,
      weeklyReport: Object.freeze({
        executiveSummary: Object.freeze({
          headline: "Weekly ready",
          narrative: "Weekly narrative",
          weeklyHighlights: Object.freeze(["Weekly highlight"]),
        }),
      }) as never,
      snapshot,
    });

    expect(summary.headline).toBe("Weekly ready");
    expect(summary.homeAvailable).toBe(true);
    expect(summary.dailyBriefAvailable).toBe(true);
    expect(summary.weeklyReportAvailable).toBe(true);
    expect(summary.snapshotAvailable).toBe(true);
    expect(summary.highlights).toContain("Home highlight");
  });

  it("builds health section from athlete state and recovery signals", () => {
    const health = buildWorkspaceHealth({
      athleteId: "athlete:1",
      athleteState: createStubAthleteState(),
      homeExperience: Object.freeze({
        recovery: Object.freeze({
          present: true,
          status: "stable",
          fatigueScore: 2,
          sleepLabel: "Good sleep",
          sleepHours: 8,
          signalSummaries: Object.freeze(["Sleep recovered"]),
          summary: "Recovery stable",
        }),
      }) as never,
    });

    expect(health.present).toBe(true);
    expect(health.recoveryStatus).toBe("stable");
    expect(health.athleteStatus).toBe("active");
    expect(health.sleepSummary).toBe("Good sleep");
  });

  it("projects coach section from explainable coaching session", () => {
    const coach = buildWorkspaceCoach({
      athleteId: "athlete:1",
      coachingSession: createStubCoachingSession(),
    });

    expect(coach.present).toBe(true);
    expect(coach.sessionId).toBeTruthy();
    expect(coach.recommendation).toBeTruthy();
  });

  it("projects snapshot section without transformation", () => {
    const snapshot = createStubAthleteSnapshot();
    const projection = buildWorkspaceSnapshot({
      athleteId: "athlete:1",
      snapshot,
    });

    expect(projection.present).toBe(true);
    expect(projection.snapshot).toBe(snapshot);
    expect(projection.snapshotId).toBe(snapshot.id);
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

    const projection = buildWorkspaceTimeline({
      athleteId: "athlete:1",
      timeline: timeline.getTimeline("athlete:1"),
    });

    expect(projection.present).toBe(true);
    expect(projection.latestEvents.length).toBe(2);
    expect(projection.latestDecisions[0]?.id).toBe("decision:1");
    expect(projection.latestRestores[0]?.id).toBe("restore:1");
  });

  it("builds insights section from proactive insights", () => {
    const insights = buildWorkspaceInsights({
      athleteId: "athlete:1",
      insights: Object.freeze([createStubInsight({ id: "ins:1" })]),
      criticalFindings: Object.freeze([createStubInsight({ id: "ins:crit" })]),
    });

    expect(insights.present).toBe(true);
    expect(insights.insights).toHaveLength(1);
    expect(insights.criticalFindings).toHaveLength(1);
  });

  it("builds a complete unified workspace", () => {
    const timeline = createTestCoachTimelineService();
    appendSeedEntry(timeline, {
      id: "decision:build",
      category: CoachTimelineEventCategories.COACH_DECISION,
      summary: "Protect recovery",
      affectedDomain: "decision",
    });
    const snapshot = createStubAthleteSnapshot();

    const result = buildUnifiedWorkspace({
      athleteId: "athlete:1",
      requestId: "req:workspace",
      generatedAt: FIXED_WORKSPACE_TIMESTAMP,
      athleteState: createStubAthleteState(),
      goalProgress: createStubGoalProgress(),
      timeline: timeline.getTimeline("athlete:1"),
      coachingSession: createStubCoachingSession(),
      snapshot,
      insights: Object.freeze([createStubInsight({ id: "ins:workspace" })]),
    });

    expect(result.success).toBe(true);
    expect(result.workspace?.id).toContain("unified-workspace:athlete:1:");
    expect(result.workspace?.snapshot.present).toBe(true);
    expect(result.workspace?.timeline.present).toBe(true);
    expect(result.workspace?.coach.present).toBe(true);
    expect(result.workspace?.health.present).toBe(true);
  });

  it("exposes dashboard APIs after composition", () => {
    const service = createTestUnifiedWorkspaceService();
    const timeline = createTestCoachTimelineService();
    appendSeedEntry(timeline, {
      id: "decision:api",
      category: CoachTimelineEventCategories.COACH_DECISION,
      summary: "Keep plan steady",
      affectedDomain: "decision",
    });
    const snapshot = createStubAthleteSnapshot();

    const composed = composeUnifiedWorkspace({
      service,
      input: {
        athleteId: "athlete:1",
        requestId: "req:api",
        athleteState: createStubAthleteState(),
        goalProgress: createStubGoalProgress(),
        timeline: timeline.getTimeline("athlete:1"),
        coachingSession: createStubCoachingSession(),
        snapshot,
        insights: Object.freeze([createStubInsight({ id: "ins:api" })]),
      },
    });

    expect(composed.success).toBe(true);
    expect(getWorkspace({ athleteId: "athlete:1", service })).not.toBeNull();
    expect(
      getWorkspaceSummary({ athleteId: "athlete:1", service })?.snapshotAvailable,
    ).toBe(true);
    expect(
      getWorkspaceHealth({ athleteId: "athlete:1", service })?.present,
    ).toBe(true);
    expect(
      getWorkspaceInsights({ athleteId: "athlete:1", service })?.present,
    ).toBe(true);
    expect(getWorkspaceCoach({ athleteId: "athlete:1", service })?.present).toBe(
      true,
    );
  });

  it("reports validation failures for missing artifacts and duplicate ids", () => {
    expect(validateWorkspace(null).valid).toBe(false);
    expect(validateWorkspace(null).errors).toContain(
      "Unified athlete workspace is missing",
    );

    const invalid = buildUnifiedWorkspace({
      athleteId: "athlete:missing",
      requestId: "req:invalid",
      generatedAt: FIXED_WORKSPACE_TIMESTAMP,
      athleteState: createStubAthleteState({ athleteId: "athlete:missing" }),
      snapshot: null,
      timeline: null,
      coachingSession: null,
    });
    expect(invalid.success).toBe(false);
    expect(invalid.validation.errors).toEqual(
      expect.arrayContaining([
        "Athlete snapshot artifact is missing",
        "Coach timeline artifact is missing",
        "Explainable coaching session artifact is missing",
      ]),
    );

    const timeline = createTestCoachTimelineService();
    appendSeedEntry(timeline, {
      id: "dup:base",
      category: CoachTimelineEventCategories.COACH_DECISION,
      summary: "Base",
      affectedDomain: "decision",
    });
    const baseTimeline = timeline.getTimeline("athlete:1");
    const duplicateEntry = Object.freeze({
      ...baseTimeline!.entries[0],
      id: "dup:1",
      summary: "First",
    });
    const duplicatedTimeline = Object.freeze({
      ...baseTimeline!,
      entries: Object.freeze([
        duplicateEntry,
        Object.freeze({
          ...duplicateEntry,
          summary: "Duplicate",
        }),
      ]),
      entryCount: 2,
    });
    const duplicateResult = buildUnifiedWorkspace({
      athleteId: "athlete:1",
      requestId: "req:dup",
      generatedAt: FIXED_WORKSPACE_TIMESTAMP,
      athleteState: createStubAthleteState(),
      timeline: duplicatedTimeline,
      coachingSession: createStubCoachingSession(),
      snapshot: createStubAthleteSnapshot(),
    });
    expect(duplicateResult.success).toBe(false);
    expect(duplicateResult.validation.errors).toEqual(
      expect.arrayContaining(["Duplicate timeline entry id: dup:1"]),
    );

    const service = createTestUnifiedWorkspaceService();
    expect(
      validateUnifiedWorkspaceForAthlete({
        athleteId: "athlete:missing",
        service,
      }).valid,
    ).toBe(false);
  });

  it("freezes immutable workspace models", () => {
    const timeline = createTestCoachTimelineService();
    appendSeedEntry(timeline, {
      id: "decision:immutable",
      category: CoachTimelineEventCategories.COACH_DECISION,
      summary: "Immutable check",
      affectedDomain: "decision",
    });

    const result = buildUnifiedWorkspace({
      athleteId: "athlete:1",
      requestId: "req:immutable",
      generatedAt: FIXED_WORKSPACE_TIMESTAMP,
      athleteState: createStubAthleteState(),
      goalProgress: createStubGoalProgress(),
      timeline: timeline.getTimeline("athlete:1"),
      coachingSession: createStubCoachingSession(),
      snapshot: createStubAthleteSnapshot(),
    });

    expect(result.success).toBe(true);
    expect(Object.isFrozen(result.workspace)).toBe(true);
    expect(Object.isFrozen(result.workspace?.summary)).toBe(true);
    expect(Object.isFrozen(result.workspace?.health)).toBe(true);
    expect(Object.isFrozen(result.workspace?.coach)).toBe(true);
    expect(Object.isFrozen(result.workspace?.snapshot)).toBe(true);
    expect(Object.isFrozen(result.workspace?.timeline)).toBe(true);
    expect(validateWorkspace(result.workspace).valid).toBe(true);
  });

  it("composes a complete workspace from existing coaching artifacts", () => {
    const clock = () => FIXED_WORKSPACE_TIMESTAMP;
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

    const intelligenceWorkspace = createAthleteWorkspaceService({
      homeExperience: homeService,
      dailyBrief: dailyService,
      weeklyCoachReport: weeklyService,
      coachTimeline,
      explainableCoachingSession: explainable,
      clock,
    });
    intelligenceWorkspace.build({
      athleteId: "athlete:1",
      requestId: "req:intel-workspace",
      athleteState: createStubAthleteState(),
      goalProgress: createStubGoalProgress(),
      planHistory: createStubPlanHistory(),
      coachingSession: createStubCoachingSession(),
      insights: Object.freeze([createStubInsight({ id: "ins:intel" })]),
    });

    const snapshotService = createAthleteSnapshotService({
      athleteWorkspace: intelligenceWorkspace,
      coachTimeline,
      explainableCoachingSession: explainable,
      weeklyCoachReport: weeklyService,
      clock,
    });
    snapshotService.build({
      athleteId: "athlete:1",
      athleteState: createStubAthleteState(),
      goalProgress: createStubGoalProgress(),
      coachingSession: createStubCoachingSession(),
    });

    const unifiedService = createUnifiedWorkspaceService({
      homeExperience: homeService,
      dailyBrief: dailyService,
      weeklyCoachReport: weeklyService,
      coachTimeline,
      explainableCoachingSession: explainable,
      athleteSnapshot: snapshotService,
      clock,
    });

    const result = unifiedService.build({
      athleteId: "athlete:1",
      requestId: "req:unified",
      athleteState: createStubAthleteState(),
      goalProgress: createStubGoalProgress(),
      coachingSession: createStubCoachingSession(),
      insights: Object.freeze([createStubInsight({ id: "ins:unified" })]),
    });

    expect(result.success).toBe(true);
    expect(result.workspace?.summary.homeAvailable).toBe(true);
    expect(result.workspace?.summary.dailyBriefAvailable).toBe(true);
    expect(result.workspace?.summary.weeklyReportAvailable).toBe(true);
    expect(result.workspace?.summary.snapshotAvailable).toBe(true);
    expect(result.workspace?.workout.present).toBe(true);
    expect(result.workspace?.nutrition.present).toBe(true);
    expect(result.workspace?.recovery.present).toBe(true);
    expect(result.workspace?.timeline.latestDecisions.length).toBeGreaterThan(0);
    expect(result.workspace?.coach.present).toBe(true);
    expect(result.workspace?.snapshot.present).toBe(true);
  });

  it("registers UnifiedWorkspaceService in Composition Root", () => {
    const root = createCompositionRoot();
    expect(root.resolve("UnifiedWorkspaceService")).toBeDefined();
    expect(root.getUnifiedWorkspaceService()).toBe(
      root.resolve("UnifiedWorkspaceService"),
    );
  });
});
