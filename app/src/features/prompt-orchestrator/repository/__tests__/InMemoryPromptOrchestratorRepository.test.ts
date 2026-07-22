import { InMemoryPromptOrchestratorRepository } from "../InMemoryPromptOrchestratorRepository";
import { createDefaultPromptPolicy } from "../../utils/createDefaultPromptPolicy";

describe("InMemoryPromptOrchestratorRepository", () => {
  it("returns default policy", async () => {
    const repository = new InMemoryPromptOrchestratorRepository();
    const policy = await repository.getPolicy();

    expect(policy.budget.maxWeight).toBe(100);
    expect(policy.selection.WORKOUT).toContain("workout");
  });

  it("stores configurable budget and priority", async () => {
    const repository = new InMemoryPromptOrchestratorRepository();
    const defaults = createDefaultPromptPolicy();

    await repository.setBudget({
      maxWeight: 50,
      weights: defaults.budget.weights,
    });
    await repository.setPriority({
      ranks: {
        ...defaults.priority.ranks,
        memory: 1,
      },
    });

    expect((await repository.getBudget()).maxWeight).toBe(50);
    expect((await repository.getPriority()).ranks.memory).toBe(1);
  });

  it("replaces full policy via setPolicy", async () => {
    const repository = new InMemoryPromptOrchestratorRepository();
    const next = createDefaultPromptPolicy();
    const updated = await repository.setPolicy({
      ...next,
      budget: {
        maxWeight: 80,
        weights: next.budget.weights,
      },
    });

    expect(updated.budget.maxWeight).toBe(80);
    expect((await repository.getPolicy()).budget.maxWeight).toBe(80);
  });
});
