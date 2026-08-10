import type { ApplicationContainer } from "../container/ApplicationContainer";
import {
  DependencyValidationError,
  MissingRegistrationError,
} from "../container/ContainerErrors";
import {
  SERVICE_TOKENS,
  type ServiceMap,
  type ServiceToken,
} from "./ServiceMap";

/**
 * Strongly typed facade over ApplicationContainer for pipeline services.
 * Future services: extend ServiceMap + SERVICE_TOKENS, then register in bootstrap.
 */
export class ServiceRegistry {
  constructor(
    private readonly container: ApplicationContainer<ServiceMap>,
  ) {}

  resolve<K extends ServiceToken>(token: K): ServiceMap[K] {
    return this.container.resolve(token);
  }

  has(token: ServiceToken): boolean {
    return this.container.has(token);
  }

  tokens(): readonly ServiceToken[] {
    return this.container.registeredTokens() as ServiceToken[];
  }

  /**
   * Assert every canonical ServiceMap token is registered exactly once.
   */
  assertIntegrity(): void {
    const registered = new Set(this.tokens());
    const missing = SERVICE_TOKENS.filter((t) => !registered.has(t));
    if (missing.length > 0) {
      throw new DependencyValidationError(
        "Service registry integrity check failed",
        missing.map((t) => `missing: ${t}`),
      );
    }

    for (const token of SERVICE_TOKENS) {
      if (!this.container.has(token)) {
        throw new MissingRegistrationError(token);
      }
    }
  }

  getProgramGenerationService(): ServiceMap["ProgramGenerationService"] {
    return this.resolve("ProgramGenerationService");
  }

  getWorkoutBlueprintService(): ServiceMap["WorkoutBlueprintService"] {
    return this.resolve("WorkoutBlueprintService");
  }

  getExerciseSelectionService(): ServiceMap["ExerciseSelectionService"] {
    return this.resolve("ExerciseSelectionService");
  }

  getProgrammingService(): ServiceMap["ProgrammingService"] {
    return this.resolve("ProgrammingService");
  }

  getProgressionService(): ServiceMap["ProgressionService"] {
    return this.resolve("ProgressionService");
  }

  getTrainingAdaptationService(): ServiceMap["TrainingAdaptationService"] {
    return this.resolve("TrainingAdaptationService");
  }

  getWorkoutAssemblyService(): ServiceMap["WorkoutAssemblyService"] {
    return this.resolve("WorkoutAssemblyService");
  }

  getAgentCapabilityService(): ServiceMap["AgentCapabilityService"] {
    return this.resolve("AgentCapabilityService");
  }

  getWorkoutAgentService(): ServiceMap["WorkoutAgentService"] {
    return this.resolve("WorkoutAgentService");
  }

  getNutritionAgentService(): ServiceMap["NutritionAgentService"] {
    return this.resolve("NutritionAgentService");
  }

  getRecoveryAgentService(): ServiceMap["RecoveryAgentService"] {
    return this.resolve("RecoveryAgentService");
  }

  getSupervisorRoutingService(): ServiceMap["SupervisorRoutingService"] {
    return this.resolve("SupervisorRoutingService");
  }

  getAgentCollaborationService(): ServiceMap["AgentCollaborationService"] {
    return this.resolve("AgentCollaborationService");
  }

  getCoachSupervisorService(): ServiceMap["CoachSupervisorService"] {
    return this.resolve("CoachSupervisorService");
  }

  getCoachingSessionService(): ServiceMap["CoachingSessionService"] {
    return this.resolve("CoachingSessionService");
  }

  getAthleteStateService(): ServiceMap["AthleteStateService"] {
    return this.resolve("AthleteStateService");
  }

  getContextFusionService(): ServiceMap["ContextFusionService"] {
    return this.resolve("ContextFusionService");
  }

  getDecisionEngineService(): ServiceMap["DecisionEngineService"] {
    return this.resolve("DecisionEngineService");
  }

  getRecommendationEngineService(): ServiceMap["RecommendationEngineService"] {
    return this.resolve("RecommendationEngineService");
  }

  getWorkoutGenerationPipelineService(): ServiceMap["WorkoutGenerationPipelineService"] {
    return this.resolve("WorkoutGenerationPipelineService");
  }

  getCoachConversationService(): ServiceMap["CoachConversationService"] {
    return this.resolve("CoachConversationService");
  }

  getPlanHistoryService(): ServiceMap["PlanHistoryService"] {
    return this.resolve("PlanHistoryService");
  }

  getPlanRestoreService(): ServiceMap["PlanRestoreService"] {
    return this.resolve("PlanRestoreService");
  }

  getCoachTimelineService(): ServiceMap["CoachTimelineService"] {
    return this.resolve("CoachTimelineService");
  }

  getProactiveInsightsService(): ServiceMap["ProactiveInsightsService"] {
    return this.resolve("ProactiveInsightsService");
  }

  getExplainableCoachingSessionService(): ServiceMap["ExplainableCoachingSessionService"] {
    return this.resolve("ExplainableCoachingSessionService");
  }

  getHomeExperienceService(): ServiceMap["HomeExperienceService"] {
    return this.resolve("HomeExperienceService");
  }

  getDailyBriefService(): ServiceMap["DailyBriefService"] {
    return this.resolve("DailyBriefService");
  }

  getWeeklyCoachReportService(): ServiceMap["WeeklyCoachReportService"] {
    return this.resolve("WeeklyCoachReportService");
  }

  getAthleteWorkspaceService(): ServiceMap["AthleteWorkspaceService"] {
    return this.resolve("AthleteWorkspaceService");
  }

  getAthleteSnapshotService(): ServiceMap["AthleteSnapshotService"] {
    return this.resolve("AthleteSnapshotService");
  }

  getUnifiedWorkspaceService(): ServiceMap["UnifiedWorkspaceService"] {
    return this.resolve("UnifiedWorkspaceService");
  }

  getAthleteIdentityService(): ServiceMap["AthleteIdentityService"] {
    return this.resolve("AthleteIdentityService");
  }

  getRuntimeEnvironmentService(): ServiceMap["RuntimeEnvironmentService"] {
    return this.resolve("RuntimeEnvironmentService");
  }

  getPersistenceContractRegistry(): ServiceMap["PersistenceContractRegistry"] {
    return this.resolve("PersistenceContractRegistry");
  }

  getRepositoryRegistry(): ServiceMap["RepositoryRegistry"] {
    return this.resolve("RepositoryRegistry");
  }

  getStorageContractRegistry(): ServiceMap["StorageContractRegistry"] {
    return this.resolve("StorageContractRegistry");
  }

  getInfrastructureAdapterRegistry(): ServiceMap["InfrastructureAdapterRegistry"] {
    return this.resolve("InfrastructureAdapterRegistry");
  }

  getSQLiteConnection(): ServiceMap["SQLiteConnection"] {
    return this.resolve("SQLiteConnection");
  }

  getSQLiteAdapter(): ServiceMap["SQLiteAdapter"] {
    return this.resolve("SQLiteAdapter");
  }

  getSQLiteRepositories(): ServiceMap["SQLiteRepositories"] {
    return this.resolve("SQLiteRepositories");
  }

  getRepositoryAdapterRegistry(): ServiceMap["RepositoryAdapterRegistry"] {
    return this.resolve("RepositoryAdapterRegistry");
  }

  getRepositoryAdapters(): ServiceMap["RepositoryAdapters"] {
    return this.resolve("RepositoryAdapters");
  }

  getAuthenticationRegistry(): ServiceMap["AuthenticationRegistry"] {
    return this.resolve("AuthenticationRegistry");
  }

  getMockAuthenticationProvider(): ServiceMap["MockAuthenticationProvider"] {
    return this.resolve("MockAuthenticationProvider");
  }

  getAuthenticationFactory(): ServiceMap["AuthenticationFactory"] {
    return this.resolve("AuthenticationFactory");
  }

  getSynchronizationRegistry(): ServiceMap["SynchronizationRegistry"] {
    return this.resolve("SynchronizationRegistry");
  }

  getSynchronizationEngine(): ServiceMap["SynchronizationEngine"] {
    return this.resolve("SynchronizationEngine");
  }

  getSynchronizationFactory(): ServiceMap["SynchronizationFactory"] {
    return this.resolve("SynchronizationFactory");
  }

  getBackendRegistry(): ServiceMap["BackendRegistry"] {
    return this.resolve("BackendRegistry");
  }

  getMockBackendProvider(): ServiceMap["MockBackendProvider"] {
    return this.resolve("MockBackendProvider");
  }

  getBackendFactory(): ServiceMap["BackendFactory"] {
    return this.resolve("BackendFactory");
  }

  getLoggerRegistry(): ServiceMap["LoggerRegistry"] {
    return this.resolve("LoggerRegistry");
  }

  getMockLogger(): ServiceMap["MockLogger"] {
    return this.resolve("MockLogger");
  }

  getLoggerFactory(): ServiceMap["LoggerFactory"] {
    return this.resolve("LoggerFactory");
  }

  getDashboardProjector(): ServiceMap["DashboardProjector"] {
    return this.resolve("DashboardProjector");
  }

  getRuntimeBootstrapService(): ServiceMap["RuntimeBootstrapService"] {
    return this.resolve("RuntimeBootstrapService");
  }

  getRepositoryHydrationService(): ServiceMap["RepositoryHydrationService"] {
    return this.resolve("RepositoryHydrationService");
  }
}
