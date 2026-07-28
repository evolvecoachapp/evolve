import {
  createCompositionRoot,
  resetCompositionRoot,
  resolveService,
} from "../createCompositionRoot";
import { createRecommendationEngineBridgeService } from "../adapters";
import { recommendationStore } from "../../../features/recommendations/service";
import { defaultUserIntelligence } from "../../../features/userIntelligence/factory";
import { WellKnownCapabilityIds } from "../../../features/agent-capability/models/CapabilityId";
import { EMPTY_SESSION_METADATA } from "../../../features/coaching-session/models/SessionMetadata";
import { SessionRequestKinds } from "../../../features/coaching-session/models/SessionRequest";

describe("CompositionRoot coaching pipeline integration", () => {
  afterEach(() => {
    resetCompositionRoot();
    recommendationStore.clear();
  });

  it("wires the full coaching architecture graph", () => {
    const root = createCompositionRoot();

    expect(root.resolve("AgentCapabilityService")).toBeDefined();
    expect(root.resolve("WorkoutAgentService")).toBeDefined();
    expect(root.resolve("NutritionAgentService")).toBeDefined();
    expect(root.resolve("RecoveryAgentService")).toBeDefined();
    expect(root.resolve("SupervisorRoutingService")).toBeDefined();
    expect(root.resolve("AgentCollaborationService")).toBeDefined();
    expect(root.resolve("CoachSupervisorService")).toBeDefined();
    expect(root.resolve("CoachingSessionService")).toBeDefined();
    expect(root.resolve("AthleteStateService")).toBeDefined();
    expect(root.resolve("ContextFusionService")).toBeDefined();
    expect(root.resolve("DecisionEngineService")).toBeDefined();
    expect(root.resolve("RecommendationEngineService")).toBeDefined();
    expect(root.resolve("WorkoutGenerationPipelineService")).toBeDefined();
    expect(root.resolve("CoachConversationService")).toBeDefined();
    expect(root.resolve("PlanHistoryService")).toBeDefined();
    expect(root.resolve("PlanRestoreService")).toBeDefined();
    expect(root.resolve("CoachTimelineService")).toBeDefined();
    expect(root.resolve("ProactiveInsightsService")).toBeDefined();
    expect(root.resolve("ExplainableCoachingSessionService")).toBeDefined();
    expect(root.resolve("HomeExperienceService")).toBeDefined();
    expect(root.resolve("DailyBriefService")).toBeDefined();
    expect(root.resolve("WeeklyCoachReportService")).toBeDefined();
    expect(root.resolve("AthleteWorkspaceService")).toBeDefined();
    expect(root.resolve("AthleteSnapshotService")).toBeDefined();
    expect(root.resolve("UnifiedWorkspaceService")).toBeDefined();
    expect(root.resolve("AthleteIdentityService")).toBeDefined();
    expect(root.resolve("RuntimeEnvironmentService")).toBeDefined();
    expect(root.resolve("PersistenceContractRegistry")).toBeDefined();
    expect(root.resolve("RepositoryRegistry")).toBeDefined();
    expect(root.resolve("StorageContractRegistry")).toBeDefined();
    expect(root.resolve("InfrastructureAdapterRegistry")).toBeDefined();
  });

  it("executes Conversation → Session → Supervisor path", () => {
    const session = resolveService("CoachingSessionService");
    const started = session.startSession({
      id: "session-req:1",
      kind: SessionRequestKinds.START,
      sessionId: null,
      conversationId: "conversation:1",
      athleteId: "athlete:1",
      message: "Plan my workout and check recovery",
      intent: "coach_conversation",
      requiredCapabilityIds: Object.freeze([
        WellKnownCapabilityIds.GENERATE_WORKOUT,
        WellKnownCapabilityIds.EVALUATE_RECOVERY,
      ]),
      metadata: EMPTY_SESSION_METADATA,
      createdAt: "2026-07-26T12:00:00.000Z",
    });

    expect(started.success).toBe(true);
    expect(started.sessionId).toBeTruthy();
    expect(started.response?.message).toBeTruthy();
  });

  it("executes Fusion → Decision → Recommendation path via bridge", () => {
    const bridge = createRecommendationEngineBridgeService(
      resolveService("RecommendationEngineService"),
      recommendationStore,
    );

    const feed = bridge.generateAndStoreRecommendations({
      userIntelligence: defaultUserIntelligence(),
      recoveryStatus: {
        overallRecovery: "medium",
        muscleSoreness: "unspecified",
      },
      workoutStatus: {
        currentLoadLevel: "unspecified",
        daysSinceLastSession: 0,
      },
      progressStatus: {
        strengthTrend: "flat",
        bodyFatTrend: "flat",
        consistency: "unspecified",
      },
    });

    expect(feed.recommendations.length).toBeGreaterThan(0);
    expect(recommendationStore.getLatest()?.recommendations.length).toBe(
      feed.recommendations.length,
    );
  });
});
