export { WorkoutBlueprintFactory } from "./WorkoutBlueprintFactory";
export type { WorkoutBlueprintFactoryDeps } from "./WorkoutBlueprintFactory";

export {
  SelectionFactory,
  ExerciseSelectionFactory,
} from "./SelectionFactory";
export type { SelectionFactoryDeps } from "./SelectionFactory";

export { ProgrammingFactory } from "./ProgrammingFactory";
export type { ProgrammingFactoryDeps } from "./ProgrammingFactory";

export { ProgressionFactory } from "./ProgressionFactory";
export type { ProgressionFactoryDeps } from "./ProgressionFactory";

export { TrainingAdaptationFactory } from "./TrainingAdaptationFactory";
export type { TrainingAdaptationFactoryDeps } from "./TrainingAdaptationFactory";

export { WorkoutAssemblyFactory } from "./WorkoutAssemblyFactory";
export type { WorkoutAssemblyFactoryDeps } from "./WorkoutAssemblyFactory";

export { ProgramGenerationFactory } from "./ProgramGenerationFactory";
export type { ProgramGenerationFactoryDeps } from "./ProgramGenerationFactory";

export { AgentCapabilityFactory } from "./AgentCapabilityFactory";

export {
  WorkoutAgentFactory,
  NutritionAgentFactory,
  RecoveryAgentFactory,
} from "./SpecialistAgentFactories";

export {
  SupervisorRoutingFactory,
  AgentCollaborationFactory,
} from "./RoutingCollaborationFactories";
export type { SupervisorRoutingFactoryDeps } from "./RoutingCollaborationFactories";

export {
  CoachSupervisorFactory,
  CoachingSessionFactory,
} from "./CoachOrchestrationFactories";
export type {
  CoachSupervisorFactoryDeps,
  CoachingSessionFactoryDeps,
} from "./CoachOrchestrationFactories";

export {
  AthleteStateFactory,
  ContextFusionFactory,
  DecisionEngineFactory,
  RecommendationEngineFactory,
} from "./DecisionPipelineFactories";
export type {
  AthleteStateFactoryDeps,
  ContextFusionFactoryDeps,
  DecisionEngineFactoryDeps,
  RecommendationEngineFactoryDeps,
} from "./DecisionPipelineFactories";

export { WorkoutGenerationPipelineFactory } from "./WorkoutGenerationPipelineFactory";
export type { WorkoutGenerationPipelineFactoryDeps } from "./WorkoutGenerationPipelineFactory";

export { CoachConversationFactory } from "./CoachConversationFactory";
export type { CoachConversationFactoryDeps } from "./CoachConversationFactory";

export { PlanHistoryFactory } from "./PlanHistoryFactory";
export type { PlanHistoryFactoryDeps } from "./PlanHistoryFactory";

export { PlanRestoreFactory } from "./PlanRestoreFactory";
export type { PlanRestoreFactoryDeps } from "./PlanRestoreFactory";

export { CoachTimelineFactory } from "./CoachTimelineFactory";
export type { CoachTimelineFactoryDeps } from "./CoachTimelineFactory";

export { ProactiveInsightsFactory } from "./ProactiveInsightsFactory";
export type { ProactiveInsightsFactoryDeps } from "./ProactiveInsightsFactory";

export { ExplainableCoachingSessionFactory } from "./ExplainableCoachingSessionFactory";
export type { ExplainableCoachingSessionFactoryDeps } from "./ExplainableCoachingSessionFactory";

export { HomeExperienceFactory } from "./HomeExperienceFactory";
export type { HomeExperienceFactoryDeps } from "./HomeExperienceFactory";

export { DailyBriefFactory } from "./DailyBriefFactory";
export type { DailyBriefFactoryDeps } from "./DailyBriefFactory";

export { WeeklyCoachReportFactory } from "./WeeklyCoachReportFactory";
export type { WeeklyCoachReportFactoryDeps } from "./WeeklyCoachReportFactory";

export { AthleteWorkspaceFactory } from "./AthleteWorkspaceFactory";
export type { AthleteWorkspaceFactoryDeps } from "./AthleteWorkspaceFactory";

export { AthleteSnapshotFactory } from "./AthleteSnapshotFactory";
export type { AthleteSnapshotFactoryDeps } from "./AthleteSnapshotFactory";

export { UnifiedWorkspaceFactory } from "./UnifiedWorkspaceFactory";
export type { UnifiedWorkspaceFactoryDeps } from "./UnifiedWorkspaceFactory";

export { AthleteIdentityFactory } from "./AthleteIdentityFactory";
export type { AthleteIdentityFactoryDeps } from "./AthleteIdentityFactory";

export { RuntimeEnvironmentFactory } from "./RuntimeEnvironmentFactory";
export type { RuntimeEnvironmentFactoryDeps } from "./RuntimeEnvironmentFactory";

export { PersistenceContractsFactory } from "./PersistenceContractsFactory";
export type { PersistenceContractsFactoryDeps } from "./PersistenceContractsFactory";

export { InfrastructureAdapterFactory } from "./InfrastructureAdapterFactory";
export type { InfrastructureAdapterFactoryDeps } from "./InfrastructureAdapterFactory";

export { SQLiteAdapterCompositionFactory as SQLiteAdapterFactory } from "./SQLiteAdapterFactory";
export type {
  SQLiteAdapterCompositionFactoryDeps as SQLiteAdapterFactoryDeps,
  SQLiteAdapterBundle,
} from "./SQLiteAdapterFactory";

export { RepositoryAdapterCompositionFactory as RepositoryAdapterFactory } from "./RepositoryAdapterFactory";
export type {
  RepositoryAdapterCompositionFactoryDeps as RepositoryAdapterFactoryDeps,
  RepositoryAdapterBundle,
} from "./RepositoryAdapterFactory";

export { AuthenticationCompositionFactory as AuthenticationFactory } from "./AuthenticationFactory";
export type {
  AuthenticationCompositionFactoryDeps as AuthenticationFactoryDeps,
  AuthenticationBundle,
} from "./AuthenticationFactory";

export { SynchronizationCompositionFactory as SynchronizationFactory } from "./SynchronizationFactory";
export type {
  SynchronizationCompositionFactoryDeps as SynchronizationFactoryDeps,
  SynchronizationBundle,
} from "./SynchronizationFactory";

export { BackendCompositionFactory as BackendFactory } from "./BackendFactory";
export type {
  BackendCompositionFactoryDeps as BackendFactoryDeps,
  BackendBundle,
} from "./BackendFactory";

export { LoggerCompositionFactory as LoggerFactory } from "./LoggerFactory";
export type {
  LoggerCompositionFactoryDeps as LoggerFactoryDeps,
  LoggerBundle,
} from "./LoggerFactory";

export { WorkoutProgressIntegrationFactory } from "./WorkoutProgressIntegrationFactory";
export type { WorkoutProgressIntegrationFactoryDeps } from "./WorkoutProgressIntegrationFactory";

export { NutritionProgressIntegrationFactory } from "./NutritionProgressIntegrationFactory";
export type { NutritionProgressIntegrationFactoryDeps } from "./NutritionProgressIntegrationFactory";

export { RecoveryProgressIntegrationFactory } from "./RecoveryProgressIntegrationFactory";
export type { RecoveryProgressIntegrationFactoryDeps } from "./RecoveryProgressIntegrationFactory";

export { GoalProgressIntegrationFactory } from "./GoalProgressIntegrationFactory";
export type { GoalProgressIntegrationFactoryDeps } from "./GoalProgressIntegrationFactory";

export { AnalyticsTimelineIntegrationFactory } from "./AnalyticsTimelineIntegrationFactory";
export type { AnalyticsTimelineIntegrationFactoryDeps } from "./AnalyticsTimelineIntegrationFactory";

export { DashboardProjectionFactory } from "./DashboardProjectionFactory";
export type { DashboardProjectionFactoryDeps } from "./DashboardProjectionFactory";

export { RuntimeBootstrapFactory } from "./RuntimeBootstrapCompositionFactory";
export type { RuntimeBootstrapFactoryDeps } from "./RuntimeBootstrapCompositionFactory";

export {
  RepositoryHydrationFactory,
  HydrationFactory,
} from "./RepositoryHydrationCompositionFactory";
export type {
  RepositoryHydrationFactoryDeps,
  HydrationFactoryDeps,
} from "./RepositoryHydrationCompositionFactory";

export { DashboardRestoreFactory } from "./DashboardRestoreCompositionFactory";
export type { DashboardRestoreFactoryDeps } from "./DashboardRestoreCompositionFactory";

export { RuntimeWriteThroughFactory } from "./RuntimeWriteThroughCompositionFactory";
export type { RuntimeWriteThroughFactoryDeps } from "./RuntimeWriteThroughCompositionFactory";
export { RuntimeSessionFactory } from "./RuntimeSessionCompositionFactory";
export type { RuntimeSessionFactoryDeps } from "./RuntimeSessionCompositionFactory";
