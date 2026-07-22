import {
  assembleWorkout,
  explainWorkout,
  previewWorkout,
} from "../index";
import { InMemoryWorkoutAssemblyRepository } from "../../repository";
import { createWorkoutAssemblyService } from "../../services";
import { createWorkoutAssemblyRequest } from "../../testSupport/fixtures";

function createService() {
  return createWorkoutAssemblyService({
    repository: new InMemoryWorkoutAssemblyRepository(),
  });
}

describe("workout assembly application", () => {
  it("assembleWorkout returns a frozen assembly result", async () => {
    const service = createService();
    const result = await assembleWorkout(
      await createWorkoutAssemblyRequest(),
      service,
    );

    expect(result.session).toBeDefined();
    expect(Object.isFrozen(result)).toBe(true);
    expect(result.requestId).toContain("assembly:");
  });

  it("previewWorkout includes explanations", async () => {
    const service = createService();
    const preview = await previewWorkout(
      await createWorkoutAssemblyRequest({ includeExplanations: false }),
      service,
    );
    expect(preview.explanations.length).toBeGreaterThan(0);
  });

  it("explainWorkout returns explanations for a cached result", async () => {
    const service = createService();
    const result = await assembleWorkout(
      await createWorkoutAssemblyRequest(),
      service,
    );
    const explanations = await explainWorkout(result.requestId, service);
    expect(explanations.length).toBeGreaterThan(0);
  });

  it("explainWorkout accepts an in-hand result", async () => {
    const service = createService();
    const result = await assembleWorkout(
      await createWorkoutAssemblyRequest({ includeExplanations: false }),
      service,
    );
    const explanations = await explainWorkout(result, service);
    expect(explanations.length).toBeGreaterThan(0);
  });
});
