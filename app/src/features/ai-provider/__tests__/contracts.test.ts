import type { IAIHealthProvider } from "../contracts/IAIHealthProvider";
import type { IAIModelProvider } from "../contracts/IAIModelProvider";
import type { IAIProvider } from "../contracts/IAIProvider";
import type { IAIStreamingProvider } from "../contracts/IAIStreamingProvider";
import type { IEmbeddingProvider } from "../contracts/IEmbeddingProvider";
import type { IFunctionCallingProvider } from "../contracts/IFunctionCallingProvider";
import type { IReasoningProvider } from "../contracts/IReasoningProvider";
import type { IToolCallingProvider } from "../contracts/IToolCallingProvider";
import type { IVisionProvider } from "../contracts/IVisionProvider";
import {
  createCapabilities,
  createStubProvider,
} from "../testSupport/fixtures";

describe("ai-provider contracts", () => {
  it("stub satisfies IAIProvider core contract", () => {
    const provider: IAIProvider = createStubProvider({ id: "contract" });

    expect(provider.id).toBe("contract");
    expect(provider.getInfo().id).toBe("contract");
    expect(provider.getCapabilities().chat).toBe(true);
    expect(provider.getConfiguration().providerId).toBe("contract");
    expect(provider.supports("chat")).toBe(true);
    expect(provider.supports("vision")).toBe(false);
  });

  it("stub satisfies streaming / health / model / capability contracts", () => {
    const provider = createStubProvider({
      id: "rich",
      capabilities: createCapabilities({
        streaming: true,
        models: true,
        tools: true,
        vision: true,
        embeddings: true,
      }),
      supportsReasoning: true,
    });

    const streaming: IAIStreamingProvider = provider;
    const health: IAIHealthProvider = provider;
    const models: IAIModelProvider = provider;
    const tools: IToolCallingProvider = provider;
    const vision: IVisionProvider = provider;
    const embeddings: IEmbeddingProvider = provider;
    const reasoning: IReasoningProvider = provider;
    const functions: IFunctionCallingProvider = provider;

    expect(streaming.supportsStreaming()).toBe(true);
    expect(health.getHealth().providerId).toBe("rich");
    expect(models.listModels().length).toBeGreaterThan(0);
    expect(models.getModel("test-model")?.id).toBe("test-model");
    expect(models.getModel("missing")).toBeNull();
    expect(tools.supportsTools()).toBe(true);
    expect(vision.supportsVision()).toBe(true);
    expect(embeddings.supportsEmbeddings()).toBe(true);
    expect(reasoning.supportsReasoning()).toBe(true);
    expect(functions.supportsFunctionCalling()).toBe(true);
  });

  it("does not expose networking or vendor SDK surfaces", () => {
    const provider = createStubProvider();
    const keys = Object.keys(provider);

    expect(keys).not.toContain("fetch");
    expect(keys).not.toContain("http");
    expect(keys).not.toContain("openai");
    expect(keys).not.toContain("anthropic");
  });
});
