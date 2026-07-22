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
}
