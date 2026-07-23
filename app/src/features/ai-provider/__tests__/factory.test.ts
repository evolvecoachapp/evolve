import { createAIProviderFactory } from "../factory";
import { createAIProviderRegistry } from "../registry";
import { AIProviderError } from "../models/AIProviderError";
import {
  createCapabilities,
  createStubProvider,
} from "../testSupport/fixtures";

describe("ai-provider factory", () => {
  it("resolves by id, model, capability, and default", () => {
    const registry = createAIProviderRegistry();
    registry.register(
      createStubProvider({
        id: "alpha",
        capabilities: createCapabilities({ streaming: true, vision: true }),
      }),
    );
    registry.register(
      createStubProvider({
        id: "beta",
        capabilities: createCapabilities({ embeddings: true }),
        models: [
          Object.freeze({
            id: "beta-model",
            providerId: "beta",
            displayName: "Beta Model",
            family: "beta",
            version: "1",
            capabilities: createCapabilities({ embeddings: true }),
            limits: Object.freeze({
              maxInputTokens: 1000,
              maxOutputTokens: 500,
              maxRequestsPerMinute: null,
              maxConcurrentRequests: null,
              maxContextWindow: 1000,
            }),
            metadata: Object.freeze({
              tags: Object.freeze([] as string[]),
              attributes: Object.freeze({}),
            }),
            available: true,
          }),
        ],
      }),
    );

    const factory = createAIProviderFactory(registry);
    factory.setDefaultProviderId("beta");

    expect(factory.resolveById("alpha").id).toBe("alpha");
    expect(factory.resolveByModel("beta-model").id).toBe("beta");
    expect(factory.resolveByCapability("streaming").id).toBe("alpha");
    expect(factory.resolveDefault().id).toBe("beta");
    expect(factory.getDefaultProviderId()).toBe("beta");
  });

  it("hard-fails when model or capability cannot be resolved", () => {
    const registry = createAIProviderRegistry();
    registry.register(createStubProvider({ id: "only" }));
    const factory = createAIProviderFactory(registry);

    expect(() => factory.resolveByModel("missing")).toThrow(AIProviderError);
    expect(() => factory.resolveByCapability("vision")).toThrow(
      AIProviderError,
    );
  });
});
