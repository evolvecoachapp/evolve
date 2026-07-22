import { createTestProgramGenerationService } from "../../testSupport/fixtures";
import { createWorkoutGenerationRequest } from "../../testSupport/fixtures";
import { ProgramGenerationService } from "../ProgramGenerationService";

describe("ProgramGenerationService", () => {
  it("is a thin wrapper over the orchestrator", async () => {
    const service = createTestProgramGenerationService();
    expect(service).toBeInstanceOf(ProgramGenerationService);

    const result = await service.generateWorkoutProgram(
      createWorkoutGenerationRequest(),
    );
    expect(result.session).toBeDefined();
    expect(result.summary.status).toBe("succeeded");
  });

  it("previewWorkoutProgram returns explanations", async () => {
    const service = createTestProgramGenerationService();
    const preview = await service.previewWorkoutProgram(
      createWorkoutGenerationRequest({ includeExplanations: false }),
    );
    expect(preview.explanations.length).toBeGreaterThan(0);
  });
});
