import { ProgrammingService } from "../../../features/programming/services/ProgrammingService";
import {
  createCompositionRoot,
  getCompositionRoot,
  resetCompositionRoot,
  resolveService,
} from "../createCompositionRoot";

describe("CompositionRoot", () => {
  afterEach(() => {
    resetCompositionRoot();
  });

  it("createCompositionRoot returns an independent root", () => {
    const a = createCompositionRoot();
    const b = createCompositionRoot();
    expect(a).not.toBe(b);
    expect(a.resolve("ProgrammingService")).not.toBe(
      b.resolve("ProgrammingService"),
    );
  });

  it("getCompositionRoot is lazy and memoized", () => {
    const a = getCompositionRoot();
    const b = getCompositionRoot();
    expect(a).toBe(b);
  });

  it("resolveService is the application-facing API", () => {
    const service = resolveService("ProgrammingService");
    expect(service).toBeInstanceOf(ProgrammingService);
  });

  it("typed getters mirror resolve tokens", () => {
    const root = createCompositionRoot();
    expect(root.getWorkoutBlueprintService()).toBe(
      root.resolve("WorkoutBlueprintService"),
    );
    expect(root.getExerciseSelectionService()).toBe(
      root.resolve("ExerciseSelectionService"),
    );
    expect(root.getProgressionService()).toBe(
      root.resolve("ProgressionService"),
    );
    expect(root.getTrainingAdaptationService()).toBe(
      root.resolve("TrainingAdaptationService"),
    );
    expect(root.getWorkoutAssemblyService()).toBe(
      root.resolve("WorkoutAssemblyService"),
    );
  });

  it("locks configuration to in-memory / default strategies", () => {
    const root = createCompositionRoot({
      configuration: {
        repositoryMode: "in-memory",
        strategyMode: "default",
      },
    });
    expect(root.configuration.repositoryMode).toBe("in-memory");
    expect(root.configuration.strategyMode).toBe("default");
  });
});
