import {
  explainAdaptations,
  evaluateTrainingReadiness,
  previewAdaptations,
} from "../index";
import { InMemoryTrainingAdaptationRepository } from "../../repository";
import { createTrainingAdaptationService } from "../../services";
import { createTrainingAdaptationRequest } from "../../testSupport/fixtures";

function createService() {
  return createTrainingAdaptationService({
    repository: new InMemoryTrainingAdaptationRepository(),
  });
}

describe("training adaptation application", () => {
  it("evaluateTrainingReadiness returns a frozen adaptation result", async () => {
    const service = createService();
    const result = await evaluateTrainingReadiness(
      await createTrainingAdaptationRequest(),
      service,
    );

    expect(result.readiness).toBeDefined();
    expect(Object.isFrozen(result)).toBe(true);
    expect(result.requestId).toContain("adaptation:");
  });

  it("previewAdaptations includes explanations", async () => {
    const service = createService();
    const preview = await previewAdaptations(
      await createTrainingAdaptationRequest({ includeExplanations: false }),
      service,
    );
    expect(preview.explanations.length).toBe(preview.recommendations.length);
  });

  it("explainAdaptations returns explanations for a cached result", async () => {
    const service = createService();
    const result = await evaluateTrainingReadiness(
      await createTrainingAdaptationRequest(),
      service,
    );
    const explanations = await explainAdaptations(result.requestId, service);
    expect(explanations.length).toBe(result.recommendations.length);
    if (explanations.length > 0) {
      expect(explanations[0]?.summaryCode.startsWith("adapt_")).toBe(true);
    }
  });

  it("explainAdaptations accepts an in-hand result", async () => {
    const service = createService();
    const result = await evaluateTrainingReadiness(
      await createTrainingAdaptationRequest({ includeExplanations: false }),
      service,
    );
    const explanations = await explainAdaptations(result, service);
    expect(explanations.length).toBe(result.recommendations.length);
  });
});
