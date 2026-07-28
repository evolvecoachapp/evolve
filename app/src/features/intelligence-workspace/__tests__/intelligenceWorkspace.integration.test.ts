import { CoachTimelineEventCategories } from "../../coach-timeline/models/CoachTimelineEvent";
import { createTestCoachTimelineService } from "../../coach-timeline/testSupport/fixtures";
import {
  createCompositionRoot,
  resetCompositionRoot,
} from "../../../core/composition/createCompositionRoot";
import { appendSeedEntry } from "../../proactive-insights/testSupport/fixtures";
import { CoachInsightSeverities } from "../../proactive-insights/models/CoachInsightSeverity";
import {
  buildAthleteWorkspace,
  buildCoachProjection,
  buildInsightProjection,
  buildMetadata,
  buildOverview,
  buildStatus,
  buildTimelineProjection,
  composeAthleteWorkspace,
  getAthleteWorkspace,
  getWorkspaceCoach,
  getWorkspaceInsights,
  getWorkspaceOverview,
  getWorkspaceStatus,
  getWorkspaceTimeline,
  validateAthleteWorkspaceForAthlete,
  validateWorkspace,
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
  createTestAthleteWorkspaceService,
  FIXED_WORKSPACE_TIMESTAMP,
} from "../testSupport/fixtures";
import { createTestHomeExperienceService } from "../../home-experience/testSupport/fixtures";
import { createTestDailyBriefService } from "../../daily-brief/testSupport/fixtures";
import { createTestWeeklyCoachReportService } from "../../weekly-report/testSupport/fixtures";
import { createExplainableCoachingSessionService } from "../../coaching-session/composition/services/ExplainableCoachingSessionService";
import { createAthleteWorkspaceService } from "../services/AthleteWorkspaceService";

describe("Athlete Intelligence Workspace integration (Sprint 28.1)", () => {
  afterEach(() => {
    resetCompositionRoot();
  });

  it("builds overview from Home Experience, Daily Brief, and Weekly Report", () => {
    const overview = buildOverview({
      athleteId: "athlete:1",
      generatedAt: FIXED_WORKSPACE_TIMESTAMP,
      homeExperience: Object.freeze({
        summary: Object.freeze({
          headline: "Home headline",
          narrative: "Home narrative",
          highlights: Object.freeze(["home-a"]),
        }),
      }) as never,
      dailyBrief: Object.freeze({
        summary: Object.freeze({
          headline: "Daily headline",
          narrative: "Daily narrative",
          highlights: Object.freeze(["daily-a"]),
        }),
      }) as never,
      weeklyReport: Object.freeze({
        executiveSummary: Object.freeze({
          headline: "Weekly headline",
          narrative: "Weekly narrative",
          weeklyHighlights: Object.freeze(["weekly-a"]),
        }),
      }) as never,
    });

    expect(overview.weeklyReportAvailable).toBe(true);
    expect(overview.headline).toBe("Weekly headline");
    expect(overview.highlights).toEqual(["home-a", "daily-a", "weekly-a"]);
  });

  it("builds status from athlete state, recovery, goal progress, and phase", () => {
    const status = buildStatus({
      athleteId: "athlete:1",
      athleteState: createStubAthleteState(),
      goalProgress: createStubGoalProgress(),
    });

    expect(status.athleteStatus).toBe("active");
    expect(status.recoveryStatus).toBe("stable");
    expect(status.goalCategory).toBeDefined();
    expect(status.currentPhase).toBe("Strength Block");
  });

  it("builds timeline projection from timeline decisions and plan history", () => {
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
      summary: "Restored prior plan",
      affectedDomain: "workout",
    });

    const projection = buildTimelineProjection({
      athleteId: "athlete:1",
      timeline: timeline.getTimeline("athlete:1"),
      latestDecisions: timeline.getTimeline("athlete:1")?.entries.slice(0, 1),
      latestRestores: timeline.getTimeline("athlete:1")?.entries.slice(1),
      planHistory: createStubPlanHistory({ currentVersionNumber: 3 }),
    });

    expect(projection.present).toBe(true);
    expect(projection.latestDecisions.length).toBe(1);
    expect(projection.latestRestores.length).toBe(1);
    expect(projection.historyVersionCount).toBe(3);
  });

  it("builds insights projection with current patterns and critical findings", () => {
    const insights = Object.freeze([
      createStubInsight({
        id: "ins:1",
        title: "Volume rising",
        severity: CoachInsightSeverities.HIGH,
      }),
      createStubInsight({
        id: "ins:2",
        title: "Recovery risk",
        severity: CoachInsightSeverities.CRITICAL,
      }),
    ]);
    const projection = buildInsightProjection({
      athleteId: "athlete:1",
      insights,
      criticalFindings: Object.freeze([insights[1]]),
    });

    expect(projection.present).toBe(true);
    expect(projection.currentPatterns).toEqual(["Volume rising", "Recovery risk"]);
    expect(projection.criticalFindings[0]?.id).toBe("ins:2");
  });

  it("builds coach projection from explainable coaching session only", () => {
    const projection = buildCoachProjection({
      athleteId: "athlete:1",
      coachingSession: createStubCoachingSession(),
    });

    expect(projection.present).toBe(true);
    expect(projection.sessionId).toBe("coach-session:1");
    expect(projection.recommendationSummary).toContain("Hold intensity");
  });

  it("builds metadata with generatedAt, version, workspaceId, and week bounds", () => {
    const metadata = buildMetadata({
      athleteId: "athlete:1",
      generatedAt: FIXED_WORKSPACE_TIMESTAMP,
      version: "28.1",
    });

    expect(metadata.generatedAt).toBe(FIXED_WORKSPACE_TIMESTAMP);
    expect(metadata.version).toBe("28.1");
    expect(metadata.workspaceId).toBe(
      `athlete-workspace:athlete:1:${FIXED_WORKSPACE_TIMESTAMP}`,
    );
    expect(metadata.weekStart).toBeTruthy();
    expect(metadata.weekEnd).toBeTruthy();
  });

  it("exposes dashboard APIs after composition", () => {
    const service = createTestAthleteWorkspaceService();
    const composed = composeAthleteWorkspace({
      service,
      input: {
        athleteId: "athlete:1",
        requestId: "req:dash",
        athleteState: createStubAthleteState(),
        goalProgress: createStubGoalProgress(),
        recoveryStatus: "stable",
        currentPhase: "Strength Block",
        homeExperience: Object.freeze({
          id: "home:1",
          summary: Object.freeze({
            headline: "Home overview",
            narrative: "Home narrative",
            highlights: Object.freeze(["home"]),
          }),
        }) as never,
        dailyBrief: Object.freeze({
          id: "brief:1",
          summary: Object.freeze({
            headline: "Daily overview",
            narrative: "Daily narrative",
            highlights: Object.freeze(["daily"]),
          }),
        }) as never,
        weeklyReport: Object.freeze({
          id: "weekly:1",
          weekStart: "2026-07-22T12:00:00.000Z",
          weekEnd: FIXED_WORKSPACE_TIMESTAMP,
          executiveSummary: Object.freeze({
            headline: "Weekly overview",
            narrative: "Weekly narrative",
            weeklyHighlights: Object.freeze(["steady"]),
          }),
        }) as never,
        coachingSession: createStubCoachingSession(),
        insights: Object.freeze([createStubInsight({ id: "ins:dash" })]),
      },
    });

    expect(composed.success).toBe(true);
    expect(getAthleteWorkspace({ athleteId: "athlete:1", service })).not.toBeNull();
    expect(getWorkspaceOverview({ athleteId: "athlete:1", service })?.headline).toBe(
      "Weekly overview",
    );
    expect(getWorkspaceStatus({ athleteId: "athlete:1", service })?.currentPhase).toBe(
      "Strength Block",
    );
    expect(getWorkspaceTimeline({ athleteId: "athlete:1", service })).not.toBeNull();
    expect(getWorkspaceInsights({ athleteId: "athlete:1", service })?.present).toBe(
      true,
    );
    expect(getWorkspaceCoach({ athleteId: "athlete:1", service })?.present).toBe(
      true,
    );
  });

  it("reports validation failures for incomplete workspaces", () => {
    const invalid = validateWorkspace(null);
    expect(invalid.valid).toBe(false);
    expect(invalid.errors).toContain("Athlete workspace is missing");

    const service = createTestAthleteWorkspaceService();
    expect(
      validateAthleteWorkspaceForAthlete({
        athleteId: "athlete:missing",
        service,
      }).valid,
    ).toBe(false);
  });

  it("freezes immutable workspace models", () => {
    const result = buildAthleteWorkspace({
      athleteId: "athlete:1",
      requestId: "req:immutable",
      generatedAt: FIXED_WORKSPACE_TIMESTAMP,
      athleteState: createStubAthleteState(),
      goalProgress: createStubGoalProgress(),
      coachingSession: createStubCoachingSession(),
      insights: Object.freeze([createStubInsight({ id: "ins:immutable" })]),
    });

    expect(result.success).toBe(true);
    expect(Object.isFrozen(result.workspace)).toBe(true);
    expect(Object.isFrozen(result.workspace?.overview)).toBe(true);
    expect(Object.isFrozen(result.workspace?.status)).toBe(true);
    expect(Object.isFrozen(result.workspace?.timeline)).toBe(true);
    expect(Object.isFrozen(result.workspace?.metadata)).toBe(true);
  });

  it("composes a complete workspace from existing premium coaching artifacts", () => {
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
      summary: "Restored earlier plan",
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

    const result = workspaceService.build({
      athleteId: "athlete:1",
      requestId: "req:full",
      athleteState: createStubAthleteState(),
      goalProgress: createStubGoalProgress(),
      planHistory: createStubPlanHistory(),
      coachingSession: createStubCoachingSession(),
      insights: Object.freeze([
        createStubInsight({
          id: "ins:full",
          severity: CoachInsightSeverities.CRITICAL,
        }),
      ]),
    });

    expect(result.success).toBe(true);
    expect(result.workspace?.home.present).toBe(true);
    expect(result.workspace?.dailyBrief.present).toBe(true);
    expect(result.workspace?.weeklyReport.present).toBe(true);
    expect(result.workspace?.timeline.latestDecisions.length).toBeGreaterThan(0);
    expect(result.workspace?.insights.criticalFindings.length).toBeGreaterThanOrEqual(0);
    expect(result.workspace?.coach.present).toBe(true);
  });

  it("registers AthleteWorkspaceService in Composition Root", () => {
    const root = createCompositionRoot();
    expect(root.resolve("AthleteWorkspaceService")).toBeDefined();
    expect(root.getAthleteWorkspaceService()).toBe(
      root.resolve("AthleteWorkspaceService"),
    );
  });
});
