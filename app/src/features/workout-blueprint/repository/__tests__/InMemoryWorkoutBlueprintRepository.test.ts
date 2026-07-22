import { createWorkoutBlueprint } from "../../testSupport/fixtures";
import { InMemoryWorkoutBlueprintRepository } from "../InMemoryWorkoutBlueprintRepository";

describe("InMemoryWorkoutBlueprintRepository", () => {
  it("saves and loads an immutable blueprint", async () => {
    const repository = new InMemoryWorkoutBlueprintRepository();
    const blueprint = createWorkoutBlueprint({ id: "bp-save" });

    const saved = await repository.save(blueprint);
    const loaded = await repository.load("bp-save");

    expect(saved.id).toBe("bp-save");
    expect(loaded).toEqual(saved);
    expect(loaded).not.toBe(saved);
    expect(Object.isFrozen(loaded)).toBe(true);
  });

  it("lists and deletes blueprints", async () => {
    const repository = new InMemoryWorkoutBlueprintRepository();
    await repository.save(createWorkoutBlueprint({ id: "bp-1" }));
    await repository.save(createWorkoutBlueprint({ id: "bp-2" }));

    const listed = await repository.list();
    expect(listed.map((entry) => entry.id).sort()).toEqual(["bp-1", "bp-2"]);

    expect(await repository.delete("bp-1")).toBe(true);
    expect(await repository.load("bp-1")).toBeNull();
    expect((await repository.list()).map((entry) => entry.id)).toEqual([
      "bp-2",
    ]);
  });

  it("rejects invalid blueprints on save", async () => {
    const repository = new InMemoryWorkoutBlueprintRepository();

    await expect(
      repository.save(createWorkoutBlueprint({ id: "" })),
    ).rejects.toMatchObject({ code: "invalid_blueprint" });
  });
});
