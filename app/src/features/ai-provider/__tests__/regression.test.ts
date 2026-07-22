import { composePromptPackage } from "../../prompt-composition/application";
import {
  createFullPromptCompositionInputs,
  FIXED_TIMESTAMP,
} from "../../prompt-composition/testSupport/fixtures";
import { prepareAIRequest } from "../application";
import { AIProviderIds, RESERVED_PROVIDER_IDS } from "../models/AIProviderId";
import { createAIProviderEngine } from "../engine";
import { createAIProviderService } from "../services";
import {
  aggregateCapabilities,
  normalizeProviderId,
} from "../utils";
import { createCapabilities, createStubProvider } from "../testSupport/fixtures";

describe("ai-provider regression", () => {
  it("normalizes provider ids consistently", () => {
    expect(normalizeProviderId("  OpenAI ")).toBe("openai");
    expect(normalizeProviderId("Anthropic")).toBe("anthropic");
  });

  it("keeps reserved provider ids as architecture placeholders only", () => {
    expect(RESERVED_PROVIDER_IDS).toEqual(
      expect.arrayContaining([
        AIProviderIds.OPENAI,
        AIProviderIds.ANTHROPIC,
        AIProviderIds.GEMINI,
        AIProviderIds.OLLAMA,
      ]),
    );

    const engine = createAIProviderEngine();
    for (const id of RESERVED_PROVIDER_IDS) {
      expect(engine.getRegistry().has(id)).toBe(false);
    }
  });

  it("aggregates capabilities across registered providers", () => {
    const caps = aggregateCapabilities([
      createCapabilities({ streaming: true }),
      createCapabilities({ tools: true, streaming: false }),
    ]);

    expect(caps.chat).toBe(true);
    expect(caps.streaming).toBe(true);
    expect(caps.tools).toBe(true);
    expect(caps.vision).toBe(false);
  });

  it("never mutates PromptPackage during request preparation", () => {
    const inputs = createFullPromptCompositionInputs();
    const composed = composePromptPackage({
      ...inputs,
      composedAt: FIXED_TIMESTAMP,
      packageId: "prompt-package:regression",
    });

    const before = JSON.stringify(composed.promptPackage);
    const engine = createAIProviderEngine();
    engine.getRegistry().register(createStubProvider({ id: "reg" }));
    const service = createAIProviderService(engine);

    prepareAIRequest({
      promptPackage: composed.promptPackage,
      providerId: "reg",
      createdAt: FIXED_TIMESTAMP,
      service,
    });

    expect(JSON.stringify(composed.promptPackage)).toBe(before);
  });

  it("does not import or register concrete vendor providers", () => {
    const engine = createAIProviderEngine();
    expect(engine.getRegistry().list()).toHaveLength(0);
    expect(engine.getRegistry().has("openai")).toBe(false);
    expect(engine.getRegistry().has("anthropic")).toBe(false);
    expect(engine.getRegistry().has("gemini")).toBe(false);
    expect(engine.getRegistry().has("ollama")).toBe(false);
  });
});
