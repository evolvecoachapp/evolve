import { composePromptPackage } from "../../prompt-composition/application";
import {
  createFullPromptCompositionInputs,
  FIXED_TIMESTAMP as PROMPT_FIXED_TIMESTAMP,
} from "../../prompt-composition/testSupport/fixtures";
import {
  createExecutionContext,
  prepareAIRequest,
  resolveProvider,
} from "../application";
import { createAIProviderEngine } from "../engine";
import { createAIProviderService } from "../services";
import { createStubProvider } from "../testSupport/fixtures";

describe("ai-provider integration", () => {
  it("consumes PromptPackage from Prompt Composition without mutating it", () => {
    const inputs = createFullPromptCompositionInputs();
    const composed = composePromptPackage({
      ...inputs,
      composedAt: PROMPT_FIXED_TIMESTAMP,
      packageId: "prompt-package:ai-integration",
    });

    const engine = createAIProviderEngine();
    engine.getRegistry().register(
      createStubProvider({ id: "integration-provider" }),
    );
    const service = createAIProviderService(engine);

    const frozenBlocks = composed.promptPackage.blocks;
    const request = prepareAIRequest({
      promptPackage: composed.promptPackage,
      providerId: "integration-provider",
      model: Object.freeze({
        id: "test-model",
        providerId: "integration-provider",
        displayName: "Test Model",
        family: "test",
        version: "1",
      }),
      createdAt: PROMPT_FIXED_TIMESTAMP,
      service,
    });

    expect(request.promptPackage.id).toBe("prompt-package:ai-integration");
    expect(request.promptPackage.blocks).toBe(frozenBlocks);
    expect(Object.isFrozen(composed.promptPackage)).toBe(true);

    const provider = resolveProvider("integration-provider", service);
    const context = createExecutionContext({
      request,
      providerId: provider.id,
      service,
      preparedAt: PROMPT_FIXED_TIMESTAMP,
    });

    expect(context.request.promptPackageId).toBe(
      "prompt-package:ai-integration",
    );
    expect(context.provider.capabilities.chat).toBe(true);
  });

  it("engine prepare returns provider contract without executing", () => {
    const inputs = createFullPromptCompositionInputs();
    const composed = composePromptPackage({
      ...inputs,
      composedAt: PROMPT_FIXED_TIMESTAMP,
      packageId: "prompt-package:ai-prepare",
    });

    const engine = createAIProviderEngine();
    engine.getRegistry().register(createStubProvider({ id: "prep" }));

    const result = engine.prepare({
      promptPackage: composed.promptPackage,
      providerId: "prep",
      model: Object.freeze({
        id: "test-model",
        providerId: "prep",
        displayName: "Test Model",
        family: "test",
        version: "1",
      }),
      requireProvider: true,
      preparedAt: PROMPT_FIXED_TIMESTAMP,
    });

    expect(result.provider?.id).toBe("prep");
    expect(result.context?.providerId).toBe("prep");
    expect(result.response).toBeNull();
    expect(Object.isFrozen(result)).toBe(true);
  });
});
