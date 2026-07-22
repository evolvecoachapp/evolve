import {
  explainProgramming,
  previewProgramming,
  programExercises,
} from "../index";
import { InMemoryProgrammingRepository } from "../../repository";
import { createProgrammingService } from "../../services";
import { createProgrammingRequest } from "../../testSupport/fixtures";

function createService() {
  return createProgrammingService({
    repository: new InMemoryProgrammingRepository(),
  });
}

describe("programming application", () => {
  it("programExercises returns a frozen programming result", async () => {
    const service = createService();
    const result = await programExercises(createProgrammingRequest(), service);

    expect(result.prescriptions.length).toBe(3);
    expect(Object.isFrozen(result)).toBe(true);
    expect(result.requestId).toContain("programming:");
  });

  it("previewProgramming includes explanations", async () => {
    const service = createService();
    const preview = await previewProgramming(
      createProgrammingRequest({ includeExplanations: false }),
      service,
    );
    expect(preview.explanations.length).toBe(preview.prescriptions.length);
  });

  it("explainProgramming returns explanations for a cached result", async () => {
    const service = createService();
    const result = await programExercises(createProgrammingRequest(), service);
    const explanations = await explainProgramming(result.requestId, service);
    expect(explanations.length).toBe(result.prescriptions.length);
    expect(explanations[0]?.summaryCode.startsWith("programmed_as_")).toBe(
      true,
    );
  });

  it("explainProgramming accepts an in-hand result", async () => {
    const service = createService();
    const result = await programExercises(
      createProgrammingRequest({ includeExplanations: false }),
      service,
    );
    const explanations = await explainProgramming(result, service);
    expect(explanations.length).toBe(result.prescriptions.length);
  });
});
