import {
  explainProgression,
  generateProgression,
  previewProgression,
} from "../index";
import { InMemoryProgressionRepository } from "../../repository";
import { createProgressionService } from "../../services";
import { createProgressionRequest } from "../../testSupport/fixtures";

function createService() {
  return createProgressionService({
    repository: new InMemoryProgressionRepository(),
  });
}

describe("progression application", () => {
  it("generateProgression returns a frozen progression plan", async () => {
    const service = createService();
    const plan = await generateProgression(
      await createProgressionRequest(),
      service,
    );

    expect(plan.exerciseProgressions.length).toBe(3);
    expect(Object.isFrozen(plan)).toBe(true);
    expect(plan.requestId).toContain("progression:");
  });

  it("previewProgression includes explanations", async () => {
    const service = createService();
    const preview = await previewProgression(
      await createProgressionRequest({ includeExplanations: false }),
      service,
    );
    expect(preview.explanations.length).toBe(
      preview.exerciseProgressions.length,
    );
  });

  it("explainProgression returns explanations for a cached plan", async () => {
    const service = createService();
    const plan = await generateProgression(
      await createProgressionRequest(),
      service,
    );
    const explanations = await explainProgression(plan.requestId, service);
    expect(explanations.length).toBe(plan.exerciseProgressions.length);
    expect(explanations[0]?.summaryCode.startsWith("progressed_as_")).toBe(
      true,
    );
  });

  it("explainProgression accepts an in-hand plan", async () => {
    const service = createService();
    const plan = await generateProgression(
      await createProgressionRequest({ includeExplanations: false }),
      service,
    );
    const explanations = await explainProgression(plan, service);
    expect(explanations.length).toBe(plan.exerciseProgressions.length);
  });
});
