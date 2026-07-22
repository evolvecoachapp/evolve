import { InMemoryProgrammingRepository } from "../../repository";
import { createProgrammingService } from "../createProgrammingService";
import { createProgrammingRequest } from "../../testSupport/fixtures";

describe("ProgrammingService", () => {
  it("programs and caches results through the repository", async () => {
    const repository = new InMemoryProgrammingRepository();
    const service = createProgrammingService({ repository });
    const result = await service.programExercises(createProgrammingRequest());

    expect(result.prescriptions.length).toBe(3);
    const cached = await service.loadCached(result.requestId);
    expect(cached?.requestId).toBe(result.requestId);
  });

  it("previewProgramming saves with explanations", async () => {
    const service = createProgrammingService({
      repository: new InMemoryProgrammingRepository(),
    });
    const preview = await service.previewProgramming(
      createProgrammingRequest({ includeExplanations: false }),
    );
    expect(preview.explanations.length).toBeGreaterThan(0);
  });
});
