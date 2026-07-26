/**
 * Composition Root & Dependency Injection Foundation (Sprint 17.9).
 *
 * Application → Composition Root → Container → Registry → Factories → Feature Services
 *
 * Object creation and dependency wiring only. No business / engine logic.
 */

export {
  ApplicationContainer,
  type RegistrationOptions,
  type ServiceFactory,
  type ServiceLifecycle,
  CircularDependencyError,
  ContainerError,
  ContainerFrozenError,
  DependencyValidationError,
  DuplicateRegistrationError,
  InvalidResolutionError,
  MissingRegistrationError,
} from "./container";

export {
  DEFAULT_COMPOSITION_CONFIGURATION,
  mergeCompositionConfiguration,
  type CompositionConfiguration,
} from "./configuration";

export {
  ConfigurationProvider,
  RepositoryProvider,
  StrategyProvider,
} from "./providers";

export {
  SERVICE_TOKENS,
  ServiceRegistry,
  type ServiceMap,
  type ServiceToken,
} from "./registry";

export {
  ExerciseSelectionFactory,
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
} from "./factories";

export {
  CompositionRoot,
  type CompositionRootOptions,
} from "./CompositionRoot";

export {
  createCompositionRoot,
  getCompositionRoot,
  resetCompositionRoot,
  resolveService,
} from "./createCompositionRoot";

export {
  createSupervisorRoutingPortAdapter,
  createAgentCollaborationPortAdapter,
  createCoachSupervisorPortAdapter,
  BoundConversationRuntimePort,
  createBoundConversationRuntimePort,
  createRecommendationEngineBridgeService,
  RecommendationEngineBridgeService,
} from "./adapters";
