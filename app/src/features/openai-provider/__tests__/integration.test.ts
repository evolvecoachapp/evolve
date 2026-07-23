import { prepareAIRequest } from "../../ai-provider/application";
import { createAIProviderEngine } from "../../ai-provider/engine";
import { AIProviderIds } from "../../ai-provider/models/AIProviderId";
import { composePromptPackage } from "../../prompt-composition/application";
import {
  createFullPromptCompositionInputs,
  FIXED_TIMESTAMP as PROMPT_FIXED_TIMESTAMP,
} from "../../prompt-composition/testSupport/fixtures";
import { executePrompt, listAvailableModels } from "../application";
import { createOpenAIProvider } from "../provider";
import { createOpenAIProviderService } from "../services";
import {
  createMockTransport,
  createOpenAIResponseFixture,
  createProviderConfiguration,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("openai-provider integration", () => {
  it("consumes PromptPackage through abstraction prepare + OpenAI execute", async () => {
    const inputs = createFullPromptCompositionInputs();
    const composed = composePromptPackage({
      ...inputs,
      composedAt: PROMPT_FIXED_TIMESTAMP,
      packageId: "prompt-package:openai-integration",
    });

    const frozenBlocks = composed.promptPackage.blocks;
    const engine = createAIProviderEngine();
    const openAI = createOpenAIProvider({
      configuration: createProviderConfiguration(),
      client: createMockTransport(
        createOpenAIResponseFixture({ content: "integrated reply" }),
      ),
      registeredAt: FIXED_TIMESTAMP,
    });
    engine.getRegistry().register(openAI);

    const request = prepareAIRequest({
      promptPackage: composed.promptPackage,
      providerId: AIProviderIds.OPENAI,
      model: Object.freeze({
        id: "gpt-4o-mini",
        providerId: AIProviderIds.OPENAI,
        displayName: "GPT-4o mini",
        family: "gpt-4o-mini",
        version: null,
      }),
      createdAt: FIXED_TIMESTAMP,
    });

    expect(request.promptPackage.blocks).toBe(frozenBlocks);
    expect(Object.isFrozen(composed.promptPackage)).toBe(true);

    const service = createOpenAIProviderService({ provider: openAI });
    const response = await executePrompt({
      promptPackage: request.promptPackage,
      modelId: request.model?.id,
      service,
      requestId: request.id,
      executedAt: FIXED_TIMESTAMP,
    });

    expect(response.providerId).toBe(AIProviderIds.OPENAI);
    expect(response.content).toBe("integrated reply");
    expect(listAvailableModels({ service }).length).toBeGreaterThan(0);
  });
});
