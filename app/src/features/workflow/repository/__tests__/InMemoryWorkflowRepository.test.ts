import { InMemoryWorkflowRepository } from "../InMemoryWorkflowRepository";
import { WorkflowError } from "../../models/WorkflowError";
import { createWorkflowDefinition } from "../../testSupport/fixtures";

describe("InMemoryWorkflowRepository", () => {
  it("saves and lists definitions", async () => {
    const repository = new InMemoryWorkflowRepository();
    const definition = createWorkflowDefinition();

    await repository.saveDefinition(definition);
    const listed = await repository.listDefinitions();

    expect(listed).toHaveLength(1);
    expect(listed[0]?.name).toBe("generate_workout");
  });

  it("gets and deletes definitions by name", async () => {
    const repository = new InMemoryWorkflowRepository();
    await repository.saveDefinition(createWorkflowDefinition());

    expect(await repository.getDefinition("generate_workout")).not.toBeNull();
    expect(await repository.deleteDefinition("generate_workout")).toBe(true);
    expect(await repository.getDefinition("generate_workout")).toBeNull();
  });

  it("rejects invalid definitions", async () => {
    const repository = new InMemoryWorkflowRepository();

    await expect(
      repository.saveDefinition(
        createWorkflowDefinition({
          name: "",
        }),
      ),
    ).rejects.toBeInstanceOf(WorkflowError);
  });

  it("clones on read", async () => {
    const repository = new InMemoryWorkflowRepository();
    await repository.saveDefinition(createWorkflowDefinition());

    const first = await repository.getDefinition("generate_workout");
    const second = await repository.getDefinition("generate_workout");

    expect(first).toEqual(second);
    expect(first).not.toBe(second);
  });
});
