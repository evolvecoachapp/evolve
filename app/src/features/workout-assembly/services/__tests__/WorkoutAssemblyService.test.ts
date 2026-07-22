import { InMemoryWorkoutAssemblyRepository } from "../../repository";
import { createWorkoutAssemblyService } from "../createWorkoutAssemblyService";
import { createWorkoutAssemblyRequest } from "../../testSupport/fixtures";

describe("WorkoutAssemblyService", () => {
  it("assembles and caches results through the repository", async () => {
    const repository = new InMemoryWorkoutAssemblyRepository();
    const service = createWorkoutAssemblyService({ repository });
    const result = await service.assembleWorkout(
      await createWorkoutAssemblyRequest(),
    );

    expect(result.session.exercises.length).toBeGreaterThan(0);
    const cached = await service.loadCached(result.requestId);
    expect(cached?.requestId).toBe(result.requestId);
  });

  it("previewWorkout saves with explanations", async () => {
    const service = createWorkoutAssemblyService({
      repository: new InMemoryWorkoutAssemblyRepository(),
    });
    const preview = await service.previewWorkout(
      await createWorkoutAssemblyRequest({ includeExplanations: false }),
    );
    expect(preview.explanations.length).toBeGreaterThan(0);
  });
});
