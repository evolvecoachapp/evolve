import { InMemoryToolRepository } from "../InMemoryToolRepository";
import { ToolError } from "../../models/ToolError";
import { createToolDefinition } from "../../testSupport/fixtures";

describe("InMemoryToolRepository", () => {
  it("saves and lists definitions", async () => {
    const repository = new InMemoryToolRepository();
    const definition = createToolDefinition();

    await repository.saveDefinition(definition);
    const listed = await repository.listDefinitions();

    expect(listed).toHaveLength(1);
    expect(listed[0]?.name).toBe("get_athlete_profile");
  });

  it("gets and deletes definitions by name", async () => {
    const repository = new InMemoryToolRepository();
    await repository.saveDefinition(createToolDefinition());

    expect(await repository.getDefinition("get_athlete_profile")).not.toBeNull();
    expect(await repository.deleteDefinition("get_athlete_profile")).toBe(true);
    expect(await repository.getDefinition("get_athlete_profile")).toBeNull();
  });

  it("rejects invalid definitions", async () => {
    const repository = new InMemoryToolRepository();

    await expect(
      repository.saveDefinition(
        createToolDefinition({
          name: "",
        }),
      ),
    ).rejects.toBeInstanceOf(ToolError);
  });

  it("clones on read", async () => {
    const repository = new InMemoryToolRepository();
    await repository.saveDefinition(createToolDefinition());

    const first = await repository.getDefinition("get_athlete_profile");
    const second = await repository.getDefinition("get_athlete_profile");

    expect(first).toEqual(second);
    expect(first).not.toBe(second);
  });
});
