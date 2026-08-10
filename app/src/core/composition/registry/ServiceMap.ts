import type { AgentCapabilityService } from "../../../features/agent-capability/services/AgentCapabilityService";
import type { WorkoutAgentService } from "../../../features/workout-agent/services/WorkoutAgentService";
import type { NutritionAgentService } from "../../../features/nutrition-agent/services/NutritionAgentService";
import type { RecoveryAgentService } from "../../../features/recovery-agent/services/RecoveryAgentService";
import type { SupervisorRoutingService } from "../../../features/supervisor-routing/services/SupervisorRoutingService";
import type { AgentCollaborationService } from "../../../features/agent-collaboration/services/AgentCollaborationService";
import type { CoachSupervisorService } from "../../../features/coach-supervisor/services/CoachSupervisorService";
import type { CoachingSessionService } from "../../../features/coaching-session/services/CoachingSessionService";
import type { AthleteStateService } from "../../../features/athlete-state/services/AthleteStateService";
import type { ContextFusionService } from "../../../features/context-fusion/services/ContextFusionService";
import type { DecisionEngineService } from "../../../features/decision-engine/services/DecisionEngineService";
import type { RecommendationEngineService } from "../../../features/recommendation-engine/services/RecommendationEngineService";
import type { WorkoutGenerationPipelineService } from "../../../features/workout-generation-pipeline/services/WorkoutGenerationPipelineService";
import type { CoachConversationService } from "../../../features/coach-conversation/services/CoachConversationService";
import type { PlanHistoryService } from "../../../features/plan-history/services/PlanHistoryService";
import type { PlanRestoreService } from "../../../features/plan-restore/services/PlanRestoreService";
import type { CoachTimelineService } from "../../../features/coach-timeline/services/CoachTimelineService";
import type { ProactiveInsightsService } from "../../../features/proactive-insights/services/ProactiveInsightsService";
import type { ExplainableCoachingSessionService } from "../../../features/coaching-session/composition/services/ExplainableCoachingSessionService";
import type { HomeExperienceService } from "../../../features/home-experience/services/HomeExperienceService";
import type { DailyBriefService } from "../../../features/daily-brief/services/DailyBriefService";
import type { WeeklyCoachReportService } from "../../../features/weekly-report/services/WeeklyCoachReportService";
import type { AthleteWorkspaceService } from "../../../features/intelligence-workspace/services/AthleteWorkspaceService";
import type { AthleteSnapshotService } from "../../../features/athlete-snapshot/services/AthleteSnapshotService";
import type { UnifiedWorkspaceService } from "../../../features/unified-workspace/services/UnifiedWorkspaceService";
import type { AthleteIdentityService } from "../../../features/athlete-identity/services/AthleteIdentityService";
import type { RuntimeEnvironmentService } from "../../../features/runtime-environment/services/RuntimeEnvironmentService";
import type { PersistenceContractRegistry } from "../../persistence/application/PersistenceContractRegistry";
import type { RepositoryRegistry } from "../../persistence/application/RepositoryRegistry";
import type { StorageContractRegistry } from "../../persistence/application/StorageContractRegistry";
import type { InfrastructureAdapterRegistry } from "../../infrastructure/application/InfrastructureAdapterRegistry";
import type { SQLiteConnection } from "../../../infrastructure/sqlite/connection/SQLiteConnection";
import type { SQLiteAdapter } from "../../../infrastructure/sqlite/application/SQLiteAdapter";
import type { SQLiteRepositories } from "../../../infrastructure/sqlite/repositories";
import type { RepositoryAdapterRegistry } from "../../../infrastructure/repositories/registry/RepositoryAdapterRegistry";
import type { RepositoryAdapters } from "../../../infrastructure/repositories/adapters";
import type { AuthenticationRegistry } from "../../../infrastructure/authentication/registry/AuthenticationRegistry";
import type { MockAuthenticationProvider } from "../../../infrastructure/authentication/provider/MockAuthenticationProvider";
import type {
  AuthenticationBundle,
  AuthenticationFactoryDeps,
} from "../../../infrastructure/authentication/application/AuthenticationFactory";
import type { SynchronizationRegistry } from "../../../infrastructure/synchronization/registry/SynchronizationRegistry";
import type { SynchronizationEngine } from "../../../infrastructure/synchronization/engine/SynchronizationEngine";
import type {
  SynchronizationBundle,
  SynchronizationFactoryDeps,
} from "../../../infrastructure/synchronization/application/SynchronizationFactory";
import type { BackendRegistry } from "../../../infrastructure/backend/registry/BackendRegistry";
import type { MockBackendProvider } from "../../../infrastructure/backend/provider/MockBackendProvider";
import type {
  BackendBundle,
  BackendFactoryDeps,
} from "../../../infrastructure/backend/application/BackendFactory";
import type { LoggerRegistry } from "../../../infrastructure/logging/registry/LoggerRegistry";
import type { MockLogger } from "../../../infrastructure/logging/logger/MockLogger";
import type {
  LoggerBundle,
  LoggerFactoryDeps,
} from "../../../infrastructure/logging/application/LoggerFactory";
import type { WorkoutProgressPublisher } from "../../../integrations/workout-progress/publishers/WorkoutProgressPublisher";
import type { ProgressAnalyticsSubscriber } from "../../../integrations/workout-progress/subscribers/ProgressAnalyticsSubscriber";
import type { NutritionProgressPublisher } from "../../../integrations/nutrition-progress/publishers/NutritionProgressPublisher";
import type { NutritionProgressSubscriber } from "../../../integrations/nutrition-progress/subscribers/NutritionProgressSubscriber";
import type { RecoveryProgressPublisher } from "../../../integrations/recovery-progress/publishers/RecoveryProgressPublisher";
import type { RecoveryProgressSubscriber } from "../../../integrations/recovery-progress/subscribers/RecoveryProgressSubscriber";
import type { GoalProgressPublisher } from "../../../integrations/goal-progress/publishers/GoalProgressPublisher";
import type { GoalProgressSubscriber } from "../../../integrations/goal-progress/subscribers/GoalProgressSubscriber";
import type { AnalyticsTimelineProjector } from "../../../integrations/analytics-timeline/projector/AnalyticsTimelineProjector";
import type { DashboardProjector } from "../../../integrations/dashboard-projection/projector/DashboardProjector";
import type { RuntimeBootstrapService } from "../../../runtime/bootstrap/RuntimeBootstrapService";
import type { HydrationService } from "../../../runtime/hydration/HydrationService";
import type { DashboardRestoreService } from "../../../runtime/dashboard-restore/DashboardRestoreService";
import type { RuntimeWriteThroughService } from "../../../runtime/write-through/RuntimeWriteThroughService";
import type { RuntimeSessionService } from "../../../runtime/session/RuntimeSessionService";
import type { ExerciseSelectionService } from "../../../features/exercise-selection/services/ExerciseSelectionService";
import type { ProgramGenerationService } from "../../../features/program-generation/services/ProgramGenerationService";
import type { ProgrammingService } from "../../../features/programming/services/ProgrammingService";
import type { ProgressionService } from "../../../features/progression/services/ProgressionService";
import type { TrainingAdaptationService } from "../../../features/training-adaptation/services/TrainingAdaptationService";
import type { WorkoutAssemblyService } from "../../../features/workout-assembly/services/WorkoutAssemblyService";
import type { WorkoutBlueprintService } from "../../../features/workout-blueprint/services/WorkoutBlueprintService";

/**
 * Strongly typed map of Composition Root services.
 * Extend this interface when registering future services.
 */
export interface ServiceMap {
  // Training Intelligence pipeline
  ProgramGenerationService: ProgramGenerationService;
  WorkoutBlueprintService: WorkoutBlueprintService;
  ExerciseSelectionService: ExerciseSelectionService;
  ProgrammingService: ProgrammingService;
  ProgressionService: ProgressionService;
  TrainingAdaptationService: TrainingAdaptationService;
  WorkoutAssemblyService: WorkoutAssemblyService;

  // Coaching architecture pipeline
  AgentCapabilityService: AgentCapabilityService;
  WorkoutAgentService: WorkoutAgentService;
  NutritionAgentService: NutritionAgentService;
  RecoveryAgentService: RecoveryAgentService;
  SupervisorRoutingService: SupervisorRoutingService;
  AgentCollaborationService: AgentCollaborationService;
  CoachSupervisorService: CoachSupervisorService;
  CoachingSessionService: CoachingSessionService;
  AthleteStateService: AthleteStateService;
  ContextFusionService: ContextFusionService;
  DecisionEngineService: DecisionEngineService;
  RecommendationEngineService: RecommendationEngineService;
  WorkoutGenerationPipelineService: WorkoutGenerationPipelineService;
  CoachConversationService: CoachConversationService;
  PlanHistoryService: PlanHistoryService;
  PlanRestoreService: PlanRestoreService;
  CoachTimelineService: CoachTimelineService;
  ProactiveInsightsService: ProactiveInsightsService;
  ExplainableCoachingSessionService: ExplainableCoachingSessionService;
  HomeExperienceService: HomeExperienceService;
  DailyBriefService: DailyBriefService;
  WeeklyCoachReportService: WeeklyCoachReportService;
  AthleteWorkspaceService: AthleteWorkspaceService;
  AthleteSnapshotService: AthleteSnapshotService;
  UnifiedWorkspaceService: UnifiedWorkspaceService;
  AthleteIdentityService: AthleteIdentityService;
  RuntimeEnvironmentService: RuntimeEnvironmentService;
  PersistenceContractRegistry: PersistenceContractRegistry;
  RepositoryRegistry: RepositoryRegistry;
  StorageContractRegistry: StorageContractRegistry;
  InfrastructureAdapterRegistry: InfrastructureAdapterRegistry;
  SQLiteConnection: SQLiteConnection;
  SQLiteAdapter: SQLiteAdapter;
  SQLiteRepositories: SQLiteRepositories;
  RepositoryAdapterRegistry: RepositoryAdapterRegistry;
  RepositoryAdapters: RepositoryAdapters;
  AuthenticationRegistry: AuthenticationRegistry;
  MockAuthenticationProvider: MockAuthenticationProvider;
  AuthenticationFactory: {
    readonly create: (
      deps?: AuthenticationFactoryDeps,
    ) => AuthenticationBundle;
  };
  SynchronizationRegistry: SynchronizationRegistry;
  SynchronizationEngine: SynchronizationEngine;
  SynchronizationFactory: {
    readonly create: (
      deps?: SynchronizationFactoryDeps,
    ) => SynchronizationBundle;
  };
  BackendRegistry: BackendRegistry;
  MockBackendProvider: MockBackendProvider;
  BackendFactory: {
    readonly create: (deps?: BackendFactoryDeps) => BackendBundle;
  };
  LoggerRegistry: LoggerRegistry;
  MockLogger: MockLogger;
  LoggerFactory: {
    readonly create: (deps?: LoggerFactoryDeps) => LoggerBundle;
  };
  WorkoutProgressPublisher: WorkoutProgressPublisher;
  ProgressAnalyticsSubscriber: ProgressAnalyticsSubscriber;
  NutritionProgressPublisher: NutritionProgressPublisher;
  NutritionProgressSubscriber: NutritionProgressSubscriber;
  RecoveryProgressPublisher: RecoveryProgressPublisher;
  RecoveryProgressSubscriber: RecoveryProgressSubscriber;
  GoalProgressPublisher: GoalProgressPublisher;
  GoalProgressSubscriber: GoalProgressSubscriber;
  AnalyticsTimelineProjector: AnalyticsTimelineProjector;
  DashboardProjector: DashboardProjector;
  RuntimeBootstrapService: RuntimeBootstrapService;
  RepositoryHydrationService: HydrationService;
  DashboardRestoreService: DashboardRestoreService;
  RuntimeWriteThroughService: RuntimeWriteThroughService;
  RuntimeSessionService: RuntimeSessionService;
}

export type ServiceToken = keyof ServiceMap;

/** Canonical ordered tokens for registry integrity checks. */
export const SERVICE_TOKENS = [
  // Training Intelligence
  "WorkoutBlueprintService",
  "ExerciseSelectionService",
  "ProgrammingService",
  "ProgressionService",
  "TrainingAdaptationService",
  "WorkoutAssemblyService",
  "ProgramGenerationService",
  // Coaching architecture
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
  "DashboardRestoreService",
  "RuntimeWriteThroughService",
  "RuntimeSessionService",
] as const satisfies readonly ServiceToken[];
