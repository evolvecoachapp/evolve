import { PromptOrchestrator } from "../PromptOrchestrator";
import { InMemoryPromptOrchestratorRepository } from "../../repository/InMemoryPromptOrchestratorRepository";
import { createPromptRequest } from "../../testSupport/fixtures";
import { PromptOrchestratorError } from "../../models/PromptOrchestratorError";

describe("PromptOrchestrator", () => {
  it("orchestrates intent detection, selection, and composition", async () => {
    const orchestrator = new PromptOrchestrator(
      new InMemoryPromptOrchestratorRepository(),
    );

    const result = await orchestrator.orchestrate(
      createPromptRequest({
        message: "How is my progress and plateau status?",
      }),
    );

    expect(result.intent).toBe("PROGRESS");
    expect(result.composition.selection.includeCoach).toBe(true);
    expect(Object.isFrozen(result.composition)).toBe(true);
    // Default budget trims memory first when all five kinds are present.
    expect(result.composition.trimmedKinds).toContain("memory");
    expect(result.composition.memory).toBeNull();
  });

  it("throws on invalid request", async () => {
    const orchestrator = new PromptOrchestrator(
      new InMemoryPromptOrchestratorRepository(),
    );

    await expect(
      orchestrator.orchestrate(createPromptRequest({ message: "  " })),
    ).rejects.toBeInstanceOf(PromptOrchestratorError);
  });
});
