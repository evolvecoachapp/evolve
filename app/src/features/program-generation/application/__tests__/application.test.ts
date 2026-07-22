import {
  explainWorkoutGeneration,
  generateWorkoutProgram,
  previewWorkoutProgram,
} from "../index";
import {
  createTestProgramGenerationService,
  createWorkoutGenerationRequest,
} from "../../testSupport/fixtures";

describe("program-generation application", () => {
  it("generateWorkoutProgram returns a frozen generation result", async () => {
    const service = createTestProgramGenerationService();
    const result = await generateWorkoutProgram(
      createWorkoutGenerationRequest(),
      service,
    );

    expect(result.session.exercises.length).toBeGreaterThan(0);
    expect(Object.isFrozen(result)).toBe(true);
    expect(result.requestId).toContain("generation:");
  });

  it("previewWorkoutProgram includes explanations", async () => {
    const service = createTestProgramGenerationService();
    const preview = await previewWorkoutProgram(
      createWorkoutGenerationRequest({ includeExplanations: false }),
      service,
    );
    expect(preview.explanations.length).toBeGreaterThan(0);
  });

  it("explainWorkoutGeneration returns explanations for an in-hand result", async () => {
    const service = createTestProgramGenerationService();
    const result = await generateWorkoutProgram(
      createWorkoutGenerationRequest({ includeExplanations: false }),
      service,
    );
    const explanations = await explainWorkoutGeneration(result, service);
    expect(explanations.length).toBeGreaterThan(0);
  });
});
