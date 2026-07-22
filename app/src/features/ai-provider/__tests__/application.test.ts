import {
  createExecutionContext,
  prepareAIRequest,
  resolveProvider,
} from "../application";
import { AIProviderError } from "../models/AIProviderError";
import { createAIProviderEngine } from "../engine";
import { createAIProviderService } from "../services";
import {
  createPreparedPromptPackage,
  createStubProvider,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("ai-provider application API", () => {
  it("prepareAIRequest returns frozen request via public API", () => {
    const promptPackage = createPreparedPromptPackage({
      id: "prompt-package:app",
    });

    const request = prepareAIRequest({
      promptPackage,
      providerId: "test-provider",
      requestId: "ai-request:app",
      createdAt: FIXED_TIMESTAMP,
    });

    expect(Object.isFrozen(request)).toBe(true);
    expect(request.id).toBe("ai-request:app");
    expect(request.promptPackageId).toBe("prompt-package:app");
  });

  it("resolveProvider and createExecutionContext work with injected service", () => {
    const engine = createAIProviderEngine();
    engine.getRegistry().register(createStubProvider({ id: "svc-provider" }));
    const service = createAIProviderService(engine);

    const provider = resolveProvider("svc-provider", service);
    expect(provider.id).toBe("svc-provider");

    const request = prepareAIRequest({
      promptPackage: createPreparedPromptPackage(),
      providerId: "svc-provider",
      model: Object.freeze({
        id: "test-model",
        providerId: "svc-provider",
        displayName: "Test Model",
        family: "test",
        version: "1",
      }),
      createdAt: FIXED_TIMESTAMP,
      service,
    });

    const context = createExecutionContext({
      request,
      service,
      preparedAt: FIXED_TIMESTAMP,
      contextId: "ai-execution:app",
    });

    expect(Object.isFrozen(context)).toBe(true);
    expect(context.id).toBe("ai-execution:app");
    expect(context.provider.id).toBe("svc-provider");
  });

  it("resolveProvider hard-fails for unregistered providers", () => {
    const engine = createAIProviderEngine();
    const service = createAIProviderService(engine);

    expect(() => resolveProvider("missing", service)).toThrow(AIProviderError);
  });
});
