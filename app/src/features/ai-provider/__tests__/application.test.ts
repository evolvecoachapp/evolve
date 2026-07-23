import {
  createAIRequest,
  createExecutionContext,
  describeProvider,
  listProviders,
  prepareAIRequest,
  resolveProvider,
  toProviderResult,
  validateProvider,
} from "../application";
import { AIResponseBuilder } from "../builders/AIResponseBuilder";
import { AIProviderError } from "../models/AIProviderError";
import { AIFinishReasons } from "../models/AIFinishReason";
import { createAIProviderEngine } from "../engine";
import { createAIProviderService } from "../services";
import {
  createPreparedPromptPackage,
  createStubProvider,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("ai-provider application API", () => {
  it("createAIRequest returns frozen request via public API", () => {
    const promptPackage = createPreparedPromptPackage({
      id: "prompt-package:app",
    });

    const request = createAIRequest({
      promptPackage,
      providerId: "test-provider",
      requestId: "ai-request:app",
      createdAt: FIXED_TIMESTAMP,
    });

    expect(Object.isFrozen(request)).toBe(true);
    expect(request.id).toBe("ai-request:app");
    expect(request.promptPackageId).toBe("prompt-package:app");
  });

  it("prepareAIRequest remains an alias of createAIRequest", () => {
    const promptPackage = createPreparedPromptPackage({
      id: "prompt-package:alias",
    });
    const viaCreate = createAIRequest({
      promptPackage,
      requestId: "ai-request:alias",
      createdAt: FIXED_TIMESTAMP,
    });
    const viaPrepare = prepareAIRequest({
      promptPackage,
      requestId: "ai-request:alias",
      createdAt: FIXED_TIMESTAMP,
    });
    expect(viaPrepare).toEqual(viaCreate);
  });

  it("resolveProvider and createExecutionContext work with injected service", () => {
    const engine = createAIProviderEngine();
    engine.getRegistry().register(createStubProvider({ id: "svc-provider" }));
    const service = createAIProviderService(engine);

    const provider = resolveProvider("svc-provider", service);
    expect(provider.id).toBe("svc-provider");

    const request = createAIRequest({
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

  it("listProviders / describeProvider / validateProvider work", () => {
    const engine = createAIProviderEngine();
    engine.getRegistry().register(createStubProvider({ id: "listed" }));
    const service = createAIProviderService(engine);

    expect(listProviders(service).map((p) => p.id)).toEqual(["listed"]);
    expect(validateProvider("listed", service)).toEqual([]);
    expect(validateProvider("missing", service)).toEqual([
      "provider_not_registered:missing",
    ]);

    const snapshot = describeProvider("listed", service);
    expect(snapshot?.provider.id).toBe("listed");
    expect(snapshot?.features.supportsChat).toBe(true);
  });

  it("toProviderResult wraps AIResponse without networking", () => {
    const engine = createAIProviderEngine();
    engine.getRegistry().register(createStubProvider({ id: "wrap" }));
    const service = createAIProviderService(engine);

    const request = createAIRequest({
      promptPackage: createPreparedPromptPackage(),
      providerId: "wrap",
      requestId: "ai-request:wrap",
      createdAt: FIXED_TIMESTAMP,
      service,
    });

    const response = new AIResponseBuilder()
      .withId("ai-response:wrap")
      .withRequestId(request.id)
      .withProviderId("wrap")
      .withContent("hello")
      .withFinishReason(AIFinishReasons.STOP)
      .withCreatedAt(FIXED_TIMESTAMP)
      .build();

    const result = toProviderResult({ request, response, service });
    expect(Object.isFrozen(result)).toBe(true);
    expect(result.response?.content).toBe("hello");
    expect(result.validationIssues).toEqual([]);
  });

  it("resolveProvider hard-fails for unregistered providers", () => {
    const engine = createAIProviderEngine();
    const service = createAIProviderService(engine);

    expect(() => resolveProvider("missing", service)).toThrow(AIProviderError);
  });
});
