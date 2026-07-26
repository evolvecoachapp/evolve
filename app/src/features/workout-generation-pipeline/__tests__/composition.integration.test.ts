import { resetCompositionRoot, resolveService } from "../../../core/composition";

describe("Composition Root Workout Generation Pipeline wiring", () => {
  afterEach(() => {
    resetCompositionRoot();
  });

  it("registers WorkoutGenerationPipelineService", () => {
    resetCompositionRoot();
    const service = resolveService("WorkoutGenerationPipelineService");
    expect(service).toBeDefined();
    expect(resolveService("WorkoutGenerationPipelineService")).toBe(service);
  });
});
