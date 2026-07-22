import { WorkoutBlueprintError } from "../../models/WorkoutBlueprintError";
import { InMemoryWorkoutBlueprintRepository } from "../../repository/InMemoryWorkoutBlueprintRepository";
import {
  createWorkoutBlueprint,
  createWorkoutBlueprintAIOutput,
  FIXED_TIMESTAMP,
} from "../../testSupport/fixtures";
import { createWorkoutBlueprintService } from "../createWorkoutBlueprintService";

describe("WorkoutBlueprintService", () => {
  it("generates, stores, and returns an immutable blueprint result", async () => {
    const repository = new InMemoryWorkoutBlueprintRepository();
    const service = createWorkoutBlueprintService(repository);

    const result = await service.generate(createWorkoutBlueprintAIOutput(), {
      id: "svc-1",
      createdAt: FIXED_TIMESTAMP,
      athleteId: "athlete-1",
    });

    expect(result.blueprint.id).toBe("svc-1");
    expect(result.validationIssues).toEqual([]);
    expect(result.generatedAt).toBe(FIXED_TIMESTAMP);
    expect(Object.isFrozen(result.blueprint)).toBe(true);
    expect(await repository.load("svc-1")).not.toBeNull();
  });

  it("validates without persisting", () => {
    const service = createWorkoutBlueprintService();
    expect(service.validate(createWorkoutBlueprint())).toEqual([]);
    expect(service.validate(createWorkoutBlueprint({ id: "" }))).toContain(
      "missing_id",
    );
  });

  it("store rejects invalid blueprints", async () => {
    const service = createWorkoutBlueprintService();

    await expect(
      service.store(createWorkoutBlueprint({ id: "" })),
    ).rejects.toBeInstanceOf(WorkoutBlueprintError);
  });

  it("lists and deletes stored blueprints", async () => {
    const service = createWorkoutBlueprintService();
    await service.generate(createWorkoutBlueprintAIOutput(), { id: "list-1" });
    await service.generate(createWorkoutBlueprintAIOutput(), { id: "list-2" });

    expect((await service.list()).map((entry) => entry.id).sort()).toEqual([
      "list-1",
      "list-2",
    ]);
    expect(await service.delete("list-1")).toBe(true);
    expect(await service.load("list-1")).toBeNull();
  });
});
