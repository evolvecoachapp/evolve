import { InMemoryProgressionRepository } from "../../repository";
import { createProgressionService } from "../createProgressionService";
import { createProgressionRequest } from "../../testSupport/fixtures";

describe("ProgressionService", () => {
  it("generates and caches plans through the repository", async () => {
    const repository = new InMemoryProgressionRepository();
    const service = createProgressionService({ repository });
    const plan = await service.generateProgression(
      await createProgressionRequest(),
    );

    expect(plan.exerciseProgressions.length).toBe(3);
    const cached = await service.loadCached(plan.requestId);
    expect(cached?.requestId).toBe(plan.requestId);
  });

  it("previewProgression saves with explanations", async () => {
    const service = createProgressionService({
      repository: new InMemoryProgressionRepository(),
    });
    const preview = await service.previewProgression(
      await createProgressionRequest({ includeExplanations: false }),
    );
    expect(preview.explanations.length).toBeGreaterThan(0);
  });
});
