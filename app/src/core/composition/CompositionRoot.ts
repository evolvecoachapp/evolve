import { ApplicationContainer } from "./container/ApplicationContainer";
import type { CompositionConfiguration } from "./configuration/CompositionConfiguration";
import {
  ProgramGenerationFactory,
  ProgrammingFactory,
  ProgressionFactory,
  SelectionFactory,
  TrainingAdaptationFactory,
  WorkoutAssemblyFactory,
  WorkoutBlueprintFactory,
  AgentCapabilityFactory,
  WorkoutAgentFactory,
  NutritionAgentFactory,
  RecoveryAgentFactory,
  SupervisorRoutingFactory,
  AgentCollaborationFactory,
  CoachSupervisorFactory,
  CoachingSessionFactory,
  AthleteStateFactory,
  ContextFusionFactory,
  DecisionEngineFactory,
  RecommendationEngineFactory,
  WorkoutGenerationPipelineFactory,
  CoachConversationFactory,
  PlanHistoryFactory,
  PlanRestoreFactory,
  CoachTimelineFactory,
  ProactiveInsightsFactory,
  ExplainableCoachingSessionFactory,
  HomeExperienceFactory,
  DailyBriefFactory,
  WeeklyCoachReportFactory,
  AthleteWorkspaceFactory,
  AthleteSnapshotFactory,
  UnifiedWorkspaceFactory,
  AthleteIdentityFactory,
  RuntimeEnvironmentFactory,
  PersistenceContractsFactory,
  InfrastructureAdapterFactory,
  SQLiteAdapterFactory,
} from "./factories";
import {
  ConfigurationProvider,
  RepositoryProvider,
  StrategyProvider,
} from "./providers";
import {
  SERVICE_TOKENS,
  ServiceRegistry,
  type ServiceMap,
  type ServiceToken,
} from "./registry";

export interface CompositionRootOptions {
  readonly configuration?: Partial<CompositionConfiguration>;
}

/**
 * Composition Root — single place that wires and exposes pipeline services.
 *
 * Application code must request services here; it must not manually `new` them.
 *
 * Wires:
 * - Training Intelligence pipeline (program generation)
 * - Coaching architecture pipeline (session → supervisor → fusion → decision → recommendation)
 */
export class CompositionRoot {
  readonly container: ApplicationContainer<ServiceMap>;
  readonly registry: ServiceRegistry;
  readonly configuration: CompositionConfiguration;
  readonly repositories: RepositoryProvider;
  readonly strategies: StrategyProvider;

  private constructor(
    container: ApplicationContainer<ServiceMap>,
    registry: ServiceRegistry,
    configuration: CompositionConfiguration,
    repositories: RepositoryProvider,
    strategies: StrategyProvider,
  ) {
    this.container = container;
    this.registry = registry;
    this.configuration = configuration;
    this.repositories = repositories;
    this.strategies = strategies;
  }

  /**
   * Bootstrap a frozen, validated Composition Root with all pipeline services.
   */
  static create(options: CompositionRootOptions = {}): CompositionRoot {
    const configProvider = new ConfigurationProvider(options.configuration);
    const configuration = configProvider.getConfiguration();
    const repositories = new RepositoryProvider(configuration);
    const strategies = new StrategyProvider(configuration);

    const lifecycle = configuration.preferSingletons
      ? ("singleton" as const)
      : ("transient" as const);

    const container = new ApplicationContainer<ServiceMap>([...SERVICE_TOKENS]);

    // ── Training Intelligence ──────────────────────────────────────────
    container.register(
      "WorkoutBlueprintService",
      () =>
        WorkoutBlueprintFactory.create({
          repository: repositories.workoutBlueprint(),
        }),
      { lifecycle },
    );

    container.register(
      "ExerciseSelectionService",
      () =>
        SelectionFactory.create({
          repository: repositories.exerciseSelection(),
          strategies: strategies.selectionStrategies(),
          selectors: strategies.selectionSelectors(),
        }),
      { lifecycle },
    );

    container.register(
      "ProgrammingService",
      () =>
        ProgrammingFactory.create({
          repository: repositories.programming(),
          strategies: strategies.programmingStrategies(),
        }),
      { lifecycle },
    );

    container.register(
      "ProgressionService",
      () =>
        ProgressionFactory.create({
          repository: repositories.progression(),
          strategies: strategies.progressionStrategies(),
        }),
      { lifecycle },
    );

    container.register(
      "TrainingAdaptationService",
      () =>
        TrainingAdaptationFactory.create({
          repository: repositories.trainingAdaptation(),
          assessments: strategies.adaptationAssessments(),
          strategies: strategies.adaptationStrategies(),
        }),
      { lifecycle },
    );

    container.register(
      "WorkoutAssemblyService",
      () =>
        WorkoutAssemblyFactory.create({
          repository: repositories.workoutAssembly(),
        }),
      { lifecycle },
    );

    container.register(
      "ProgramGenerationService",
      () =>
        ProgramGenerationFactory.create({
          blueprintService: container.resolve("WorkoutBlueprintService"),
          selectionService: container.resolve("ExerciseSelectionService"),
          programmingService: container.resolve("ProgrammingService"),
          progressionService: container.resolve("ProgressionService"),
          adaptationService: container.resolve("TrainingAdaptationService"),
          assemblyService: container.resolve("WorkoutAssemblyService"),
        }),
      { lifecycle },
    );

    // ── Coaching architecture ──────────────────────────────────────────
    container.register(
      "AgentCapabilityService",
      () => AgentCapabilityFactory.create(),
      { lifecycle },
    );

    container.register(
      "CoachTimelineService",
      () => CoachTimelineFactory.create(),
      { lifecycle },
    );

    container.register(
      "PlanHistoryService",
      () => PlanHistoryFactory.create(),
      { lifecycle },
    );

    container.register(
      "ProactiveInsightsService",
      () =>
        ProactiveInsightsFactory.create({
          coachTimeline: container.resolve("CoachTimelineService"),
          planHistory: container.resolve("PlanHistoryService"),
        }),
      { lifecycle },
    );

    container.register(
      "ExplainableCoachingSessionService",
      () =>
        ExplainableCoachingSessionFactory.create({
          coachTimeline: container.resolve("CoachTimelineService"),
          planHistory: container.resolve("PlanHistoryService"),
          proactiveInsights: container.resolve("ProactiveInsightsService"),
        }),
      { lifecycle },
    );

    container.register(
      "HomeExperienceService",
      () =>
        HomeExperienceFactory.create({
          coachTimeline: container.resolve("CoachTimelineService"),
          planHistory: container.resolve("PlanHistoryService"),
          proactiveInsights: container.resolve("ProactiveInsightsService"),
          explainableCoachingSession: container.resolve(
            "ExplainableCoachingSessionService",
          ),
        }),
      { lifecycle },
    );

    container.register(
      "DailyBriefService",
      () =>
        DailyBriefFactory.create({
          homeExperience: container.resolve("HomeExperienceService"),
          coachTimeline: container.resolve("CoachTimelineService"),
          planHistory: container.resolve("PlanHistoryService"),
          proactiveInsights: container.resolve("ProactiveInsightsService"),
          explainableCoachingSession: container.resolve(
            "ExplainableCoachingSessionService",
          ),
        }),
      { lifecycle },
    );

    container.register(
      "WeeklyCoachReportService",
      () =>
        WeeklyCoachReportFactory.create({
          dailyBrief: container.resolve("DailyBriefService"),
          homeExperience: container.resolve("HomeExperienceService"),
          coachTimeline: container.resolve("CoachTimelineService"),
          planHistory: container.resolve("PlanHistoryService"),
          proactiveInsights: container.resolve("ProactiveInsightsService"),
          explainableCoachingSession: container.resolve(
            "ExplainableCoachingSessionService",
          ),
        }),
      { lifecycle },
    );

    container.register(
      "AthleteWorkspaceService",
      () =>
        AthleteWorkspaceFactory.create({
          athleteState: container.resolve("AthleteStateService"),
          homeExperience: container.resolve("HomeExperienceService"),
          dailyBrief: container.resolve("DailyBriefService"),
          weeklyCoachReport: container.resolve("WeeklyCoachReportService"),
          coachTimeline: container.resolve("CoachTimelineService"),
          planHistory: container.resolve("PlanHistoryService"),
          planRestore: container.resolve("PlanRestoreService"),
          proactiveInsights: container.resolve("ProactiveInsightsService"),
          explainableCoachingSession: container.resolve(
            "ExplainableCoachingSessionService",
          ),
        }),
      { lifecycle },
    );

    container.register(
      "AthleteSnapshotService",
      () =>
        AthleteSnapshotFactory.create({
          athleteState: container.resolve("AthleteStateService"),
          athleteWorkspace: container.resolve("AthleteWorkspaceService"),
          coachTimeline: container.resolve("CoachTimelineService"),
          explainableCoachingSession: container.resolve(
            "ExplainableCoachingSessionService",
          ),
          weeklyCoachReport: container.resolve("WeeklyCoachReportService"),
        }),
      { lifecycle },
    );

    container.register(
      "UnifiedWorkspaceService",
      () =>
        UnifiedWorkspaceFactory.create({
          athleteState: container.resolve("AthleteStateService"),
          homeExperience: container.resolve("HomeExperienceService"),
          dailyBrief: container.resolve("DailyBriefService"),
          weeklyCoachReport: container.resolve("WeeklyCoachReportService"),
          coachTimeline: container.resolve("CoachTimelineService"),
          proactiveInsights: container.resolve("ProactiveInsightsService"),
          explainableCoachingSession: container.resolve(
            "ExplainableCoachingSessionService",
          ),
          athleteSnapshot: container.resolve("AthleteSnapshotService"),
        }),
      { lifecycle },
    );

    container.register(
      "AthleteIdentityService",
      () => AthleteIdentityFactory.create(),
      { lifecycle },
    );

    container.register(
      "RuntimeEnvironmentService",
      () => RuntimeEnvironmentFactory.create(),
      { lifecycle },
    );

    container.register(
      "PersistenceContractRegistry",
      () => PersistenceContractsFactory.create(),
      { lifecycle },
    );

    container.register(
      "RepositoryRegistry",
      () =>
        container
          .resolve("PersistenceContractRegistry")
          .getRepositoryRegistry(),
      { lifecycle },
    );

    container.register(
      "StorageContractRegistry",
      () =>
        container
          .resolve("PersistenceContractRegistry")
          .getStorageContractRegistry(),
      { lifecycle },
    );

    container.register(
      "InfrastructureAdapterRegistry",
      () => InfrastructureAdapterFactory.create(),
      { lifecycle },
    );

    container.register(
      "SQLiteConnection",
      () => SQLiteAdapterFactory.create().connection,
      { lifecycle },
    );

    container.register(
      "SQLiteAdapter",
      () => {
        const connection = container.resolve("SQLiteConnection");
        return SQLiteAdapterFactory.create({ connection }).adapter;
      },
      { lifecycle },
    );

    container.register(
      "SQLiteRepositories",
      () => container.resolve("SQLiteAdapter").repositories,
      { lifecycle },
    );

    container.register(
      "WorkoutAgentService",
      () => WorkoutAgentFactory.create(),
      { lifecycle },
    );

    container.register(
      "NutritionAgentService",
      () =>
        NutritionAgentFactory.create({
          coachTimeline: container.resolve("CoachTimelineService"),
        }),
      { lifecycle },
    );

    container.register(
      "RecoveryAgentService",
      () =>
        RecoveryAgentFactory.create({
          coachTimeline: container.resolve("CoachTimelineService"),
        }),
      { lifecycle },
    );

    container.register(
      "SupervisorRoutingService",
      () =>
        SupervisorRoutingFactory.create({
          capabilityService: container.resolve("AgentCapabilityService"),
        }),
      { lifecycle },
    );

    container.register(
      "AgentCollaborationService",
      () => AgentCollaborationFactory.create(),
      { lifecycle },
    );

    container.register(
      "CoachSupervisorService",
      () =>
        CoachSupervisorFactory.create({
          routing: container.resolve("SupervisorRoutingService"),
          collaboration: container.resolve("AgentCollaborationService"),
        }),
      { lifecycle },
    );

    container.register(
      "CoachingSessionService",
      () =>
        CoachingSessionFactory.create({
          supervisor: container.resolve("CoachSupervisorService"),
        }),
      { lifecycle },
    );

    container.register(
      "AthleteStateService",
      () =>
        AthleteStateFactory.create({
          workoutAgent: container.resolve("WorkoutAgentService"),
          nutritionAgent: container.resolve("NutritionAgentService"),
          recoveryAgent: container.resolve("RecoveryAgentService"),
        }),
      { lifecycle },
    );

    container.register(
      "ContextFusionService",
      () =>
        ContextFusionFactory.create({
          athleteState: container.resolve("AthleteStateService"),
          coachingSession: container.resolve("CoachingSessionService"),
          supervisor: container.resolve("CoachSupervisorService"),
          workoutAgent: container.resolve("WorkoutAgentService"),
          nutritionAgent: container.resolve("NutritionAgentService"),
          recoveryAgent: container.resolve("RecoveryAgentService"),
        }),
      { lifecycle },
    );

    container.register(
      "DecisionEngineService",
      () =>
        DecisionEngineFactory.create({
          contextFusion: container.resolve("ContextFusionService"),
          athleteState: container.resolve("AthleteStateService"),
          supervisor: container.resolve("CoachSupervisorService"),
          coachTimeline: container.resolve("CoachTimelineService"),
        }),
      { lifecycle },
    );

    container.register(
      "RecommendationEngineService",
      () =>
        RecommendationEngineFactory.create({
          decisionEngine: container.resolve("DecisionEngineService"),
          contextFusion: container.resolve("ContextFusionService"),
          athleteState: container.resolve("AthleteStateService"),
          supervisor: container.resolve("CoachSupervisorService"),
        }),
      { lifecycle },
    );

    container.register(
      "WorkoutGenerationPipelineService",
      () =>
        WorkoutGenerationPipelineFactory.create({
          coachingSession: container.resolve("CoachingSessionService"),
          coachSupervisor: container.resolve("CoachSupervisorService"),
          workoutAgent: container.resolve("WorkoutAgentService"),
          athleteState: container.resolve("AthleteStateService"),
          contextFusion: container.resolve("ContextFusionService"),
          decisionEngine: container.resolve("DecisionEngineService"),
          recommendationEngine: container.resolve(
            "RecommendationEngineService",
          ),
        }),
      { lifecycle },
    );

    container.register(
      "PlanRestoreService",
      () =>
        PlanRestoreFactory.create({
          planHistory: container.resolve("PlanHistoryService"),
          coachTimeline: container.resolve("CoachTimelineService"),
        }),
      { lifecycle },
    );

    container.register(
      "CoachConversationService",
      () =>
        CoachConversationFactory.create({
          coachingSession: container.resolve("CoachingSessionService"),
          coachSupervisor: container.resolve("CoachSupervisorService"),
          supervisorRouting: container.resolve("SupervisorRoutingService"),
          workoutPipeline: container.resolve(
            "WorkoutGenerationPipelineService",
          ),
          planHistory: container.resolve("PlanHistoryService"),
          planRestore: container.resolve("PlanRestoreService"),
          coachTimeline: container.resolve("CoachTimelineService"),
          proactiveInsights: container.resolve("ProactiveInsightsService"),
          explainableCoachingSession: container.resolve(
            "ExplainableCoachingSessionService",
          ),
        }),
      { lifecycle },
    );

    container.validate();
    container.freeze();

    const registry = new ServiceRegistry(container);
    registry.assertIntegrity();

    return new CompositionRoot(
      container,
      registry,
      configuration,
      repositories,
      strategies,
    );
  }

  resolve<K extends ServiceToken>(token: K): ServiceMap[K] {
    return this.registry.resolve(token);
  }

  getProgramGenerationService(): ServiceMap["ProgramGenerationService"] {
    return this.registry.getProgramGenerationService();
  }

  getWorkoutBlueprintService(): ServiceMap["WorkoutBlueprintService"] {
    return this.registry.getWorkoutBlueprintService();
  }

  getExerciseSelectionService(): ServiceMap["ExerciseSelectionService"] {
    return this.registry.getExerciseSelectionService();
  }

  getProgrammingService(): ServiceMap["ProgrammingService"] {
    return this.registry.getProgrammingService();
  }

  getProgressionService(): ServiceMap["ProgressionService"] {
    return this.registry.getProgressionService();
  }

  getTrainingAdaptationService(): ServiceMap["TrainingAdaptationService"] {
    return this.registry.getTrainingAdaptationService();
  }

  getWorkoutAssemblyService(): ServiceMap["WorkoutAssemblyService"] {
    return this.registry.getWorkoutAssemblyService();
  }

  getCoachingSessionService(): ServiceMap["CoachingSessionService"] {
    return this.registry.resolve("CoachingSessionService");
  }

  getCoachSupervisorService(): ServiceMap["CoachSupervisorService"] {
    return this.registry.resolve("CoachSupervisorService");
  }

  getRecommendationEngineService(): ServiceMap["RecommendationEngineService"] {
    return this.registry.resolve("RecommendationEngineService");
  }

  getWorkoutGenerationPipelineService(): ServiceMap["WorkoutGenerationPipelineService"] {
    return this.registry.resolve("WorkoutGenerationPipelineService");
  }

  getCoachConversationService(): ServiceMap["CoachConversationService"] {
    return this.registry.resolve("CoachConversationService");
  }

  getPlanHistoryService(): ServiceMap["PlanHistoryService"] {
    return this.registry.resolve("PlanHistoryService");
  }

  getPlanRestoreService(): ServiceMap["PlanRestoreService"] {
    return this.registry.resolve("PlanRestoreService");
  }

  getCoachTimelineService(): ServiceMap["CoachTimelineService"] {
    return this.registry.resolve("CoachTimelineService");
  }

  getProactiveInsightsService(): ServiceMap["ProactiveInsightsService"] {
    return this.registry.resolve("ProactiveInsightsService");
  }

  getExplainableCoachingSessionService(): ServiceMap["ExplainableCoachingSessionService"] {
    return this.registry.resolve("ExplainableCoachingSessionService");
  }

  getHomeExperienceService(): ServiceMap["HomeExperienceService"] {
    return this.registry.resolve("HomeExperienceService");
  }

  getDailyBriefService(): ServiceMap["DailyBriefService"] {
    return this.registry.resolve("DailyBriefService");
  }

  getWeeklyCoachReportService(): ServiceMap["WeeklyCoachReportService"] {
    return this.registry.resolve("WeeklyCoachReportService");
  }

  getAthleteWorkspaceService(): ServiceMap["AthleteWorkspaceService"] {
    return this.registry.resolve("AthleteWorkspaceService");
  }

  getAthleteSnapshotService(): ServiceMap["AthleteSnapshotService"] {
    return this.registry.resolve("AthleteSnapshotService");
  }

  getUnifiedWorkspaceService(): ServiceMap["UnifiedWorkspaceService"] {
    return this.registry.resolve("UnifiedWorkspaceService");
  }

  getAthleteIdentityService(): ServiceMap["AthleteIdentityService"] {
    return this.registry.resolve("AthleteIdentityService");
  }

  getRuntimeEnvironmentService(): ServiceMap["RuntimeEnvironmentService"] {
    return this.registry.resolve("RuntimeEnvironmentService");
  }

  getPersistenceContractRegistry(): ServiceMap["PersistenceContractRegistry"] {
    return this.registry.resolve("PersistenceContractRegistry");
  }

  getRepositoryRegistry(): ServiceMap["RepositoryRegistry"] {
    return this.registry.resolve("RepositoryRegistry");
  }

  getStorageContractRegistry(): ServiceMap["StorageContractRegistry"] {
    return this.registry.resolve("StorageContractRegistry");
  }

  getInfrastructureAdapterRegistry(): ServiceMap["InfrastructureAdapterRegistry"] {
    return this.registry.resolve("InfrastructureAdapterRegistry");
  }

  getSQLiteConnection(): ServiceMap["SQLiteConnection"] {
    return this.registry.resolve("SQLiteConnection");
  }

  getSQLiteAdapter(): ServiceMap["SQLiteAdapter"] {
    return this.registry.resolve("SQLiteAdapter");
  }

  getSQLiteRepositories(): ServiceMap["SQLiteRepositories"] {
    return this.registry.resolve("SQLiteRepositories");
  }

  getDecisionEngineService(): ServiceMap["DecisionEngineService"] {
    return this.registry.resolve("DecisionEngineService");
  }

  getContextFusionService(): ServiceMap["ContextFusionService"] {
    return this.registry.resolve("ContextFusionService");
  }

  getAthleteStateService(): ServiceMap["AthleteStateService"] {
    return this.registry.resolve("AthleteStateService");
  }
}
