import { ProgramGenerationService } from "../../../features/program-generation/services/ProgramGenerationService";
import { ProgrammingService } from "../../../features/programming/services/ProgrammingService";
import { ProgressionService } from "../../../features/progression/services/ProgressionService";
import { ExerciseSelectionService } from "../../../features/exercise-selection/services/ExerciseSelectionService";
import { TrainingAdaptationService } from "../../../features/training-adaptation/services/TrainingAdaptationService";
import { WorkoutAssemblyService } from "../../../features/workout-assembly/services/WorkoutAssemblyService";
import { WorkoutBlueprintService } from "../../../features/workout-blueprint/services/WorkoutBlueprintService";
import {
  ProgramGenerationFactory,
  ProgrammingFactory,
  ProgressionFactory,
  SelectionFactory,
  TrainingAdaptationFactory,
  WorkoutAssemblyFactory,
  WorkoutBlueprintFactory,
} from "../factories";
import { ConfigurationProvider } from "../providers/ConfigurationProvider";
import { RepositoryProvider } from "../providers/RepositoryProvider";
import { StrategyProvider } from "../providers/StrategyProvider";

describe("Composition factories", () => {
  const configuration = new ConfigurationProvider().getConfiguration();
  const repositories = new RepositoryProvider(configuration);
  const strategies = new StrategyProvider(configuration);

  it("WorkoutBlueprintFactory creates WorkoutBlueprintService", () => {
    const service = WorkoutBlueprintFactory.create({
      repository: repositories.workoutBlueprint(),
    });
    expect(service).toBeInstanceOf(WorkoutBlueprintService);
  });

  it("SelectionFactory creates ExerciseSelectionService", () => {
    const service = SelectionFactory.create({
      repository: repositories.exerciseSelection(),
      strategies: strategies.selectionStrategies(),
      selectors: strategies.selectionSelectors(),
    });
    expect(service).toBeInstanceOf(ExerciseSelectionService);
  });

  it("ProgrammingFactory creates ProgrammingService", () => {
    const service = ProgrammingFactory.create({
      repository: repositories.programming(),
      strategies: strategies.programmingStrategies(),
    });
    expect(service).toBeInstanceOf(ProgrammingService);
  });

  it("ProgressionFactory creates ProgressionService", () => {
    const service = ProgressionFactory.create({
      repository: repositories.progression(),
      strategies: strategies.progressionStrategies(),
    });
    expect(service).toBeInstanceOf(ProgressionService);
  });

  it("TrainingAdaptationFactory creates TrainingAdaptationService", () => {
    const service = TrainingAdaptationFactory.create({
      repository: repositories.trainingAdaptation(),
      assessments: strategies.adaptationAssessments(),
      strategies: strategies.adaptationStrategies(),
    });
    expect(service).toBeInstanceOf(TrainingAdaptationService);
  });

  it("WorkoutAssemblyFactory creates WorkoutAssemblyService", () => {
    const service = WorkoutAssemblyFactory.create({
      repository: repositories.workoutAssembly(),
    });
    expect(service).toBeInstanceOf(WorkoutAssemblyService);
  });

  it("ProgramGenerationFactory wires orchestrator dependencies", () => {
    const blueprint = WorkoutBlueprintFactory.create({
      repository: repositories.workoutBlueprint(),
    });
    const selection = SelectionFactory.create({
      repository: repositories.exerciseSelection(),
      strategies: strategies.selectionStrategies(),
      selectors: strategies.selectionSelectors(),
    });
    const programming = ProgrammingFactory.create({
      repository: repositories.programming(),
      strategies: strategies.programmingStrategies(),
    });
    const progression = ProgressionFactory.create({
      repository: repositories.progression(),
      strategies: strategies.progressionStrategies(),
    });
    const adaptation = TrainingAdaptationFactory.create({
      repository: repositories.trainingAdaptation(),
      assessments: strategies.adaptationAssessments(),
      strategies: strategies.adaptationStrategies(),
    });
    const assembly = WorkoutAssemblyFactory.create({
      repository: repositories.workoutAssembly(),
    });

    const service = ProgramGenerationFactory.create({
      blueprintService: blueprint,
      selectionService: selection,
      programmingService: programming,
      progressionService: progression,
      adaptationService: adaptation,
      assemblyService: assembly,
    });
    expect(service).toBeInstanceOf(ProgramGenerationService);
  });
});
