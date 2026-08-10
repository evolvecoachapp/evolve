import {
  ApplicationContainer,
  DependencyValidationError,
} from "../container";
import {
  SERVICE_TOKENS,
  ServiceRegistry,
  type ServiceMap,
} from "../registry";
import { createCompositionRoot, resetCompositionRoot } from "../createCompositionRoot";

describe("ServiceRegistry", () => {
  afterEach(() => {
    resetCompositionRoot();
  });

  it("exposes all canonical service tokens", () => {
    expect(SERVICE_TOKENS).toEqual([
      "WorkoutBlueprintService",
      "ExerciseSelectionService",
      "ProgrammingService",
      "ProgressionService",
      "TrainingAdaptationService",
      "WorkoutAssemblyService",
      "ProgramGenerationService",
      "AgentCapabilityService",
      "WorkoutAgentService",
      "NutritionAgentService",
      "RecoveryAgentService",
      "SupervisorRoutingService",
      "AgentCollaborationService",
      "CoachSupervisorService",
      "CoachingSessionService",
      "AthleteStateService",
      "ContextFusionService",
      "DecisionEngineService",
      "RecommendationEngineService",
      "WorkoutGenerationPipelineService",
      "CoachConversationService",
      "PlanHistoryService",
      "PlanRestoreService",
      "CoachTimelineService",
      "ProactiveInsightsService",
      "ExplainableCoachingSessionService",
      "HomeExperienceService",
      "DailyBriefService",
      "WeeklyCoachReportService",
      "AthleteWorkspaceService",
      "AthleteSnapshotService",
      "UnifiedWorkspaceService",
      "AthleteIdentityService",
      "RuntimeEnvironmentService",
      "PersistenceContractRegistry",
      "RepositoryRegistry",
      "StorageContractRegistry",
      "InfrastructureAdapterRegistry",
      "SQLiteConnection",
      "SQLiteAdapter",
      "SQLiteRepositories",
      "RepositoryAdapterRegistry",
      "RepositoryAdapters",
      "AuthenticationRegistry",
      "MockAuthenticationProvider",
      "AuthenticationFactory",
      "SynchronizationRegistry",
      "SynchronizationEngine",
      "SynchronizationFactory",
      "BackendRegistry",
      "MockBackendProvider",
      "BackendFactory",
      "LoggerRegistry",
      "MockLogger",
      "LoggerFactory",
      "WorkoutProgressPublisher",
      "ProgressAnalyticsSubscriber",
      "NutritionProgressPublisher",
      "NutritionProgressSubscriber",
      "RecoveryProgressPublisher",
      "RecoveryProgressSubscriber",
      "GoalProgressPublisher",
      "GoalProgressSubscriber",
      "AnalyticsTimelineProjector",
      "DashboardProjector",
      "RuntimeBootstrapService",
      "RepositoryHydrationService",
    ]);
  });

  it("assertIntegrity passes for a fully wired composition root", () => {
    const root = createCompositionRoot();
    expect(() => root.registry.assertIntegrity()).not.toThrow();
    expect([...root.registry.tokens()].sort()).toEqual(
      [...SERVICE_TOKENS].sort(),
    );
  });

  it("assertIntegrity fails when a required token is missing", () => {
    const container = new ApplicationContainer<ServiceMap>([
      ...SERVICE_TOKENS,
    ]);
    // Intentionally incomplete — no registrations.
    const registry = new ServiceRegistry(container);
    expect(() => registry.assertIntegrity()).toThrow(DependencyValidationError);
  });

  it("typed getters resolve concrete services", () => {
    const root = createCompositionRoot();
    expect(root.registry.getProgrammingService()).toBe(
      root.resolve("ProgrammingService"),
    );
    expect(root.registry.getProgramGenerationService()).toBe(
      root.resolve("ProgramGenerationService"),
    );
  });
});
