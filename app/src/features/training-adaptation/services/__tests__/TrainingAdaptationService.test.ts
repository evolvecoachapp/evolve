import { InMemoryTrainingAdaptationRepository } from "../../repository";
import { createTrainingAdaptationService } from "../createTrainingAdaptationService";
import { createTrainingAdaptationRequest } from "../../testSupport/fixtures";

describe("TrainingAdaptationService", () => {
  it("evaluates and caches results through the repository", async () => {
    const repository = new InMemoryTrainingAdaptationRepository();
    const service = createTrainingAdaptationService({ repository });
    const result = await service.evaluateTrainingReadiness(
      await createTrainingAdaptationRequest(),
    );

    expect(result.readiness.overallScore).toBeGreaterThanOrEqual(0);
    const cached = await service.loadCached(result.requestId);
    expect(cached?.requestId).toBe(result.requestId);
  });

  it("previewAdaptations saves with explanations", async () => {
    const service = createTrainingAdaptationService({
      repository: new InMemoryTrainingAdaptationRepository(),
    });
    const preview = await service.previewAdaptations(
      await createTrainingAdaptationRequest({ includeExplanations: false }),
    );
    expect(preview.explanations.length).toBe(preview.recommendations.length);
  });
});
