import { AIProviderIds } from "../../ai-provider/models/AIProviderId";
import { AIProviderError } from "../../ai-provider/models/AIProviderError";
import { createOpenAIProvider } from "../provider/OpenAIProvider";
import {
  createClientOptions,
  createMockTransport,
  createOpenAIResponseFixture,
  createPromptPackageFixture,
  createProviderConfiguration,
  FIXED_TIMESTAMP,
} from "../testSupport/fixtures";

describe("openai-provider provider", () => {
  it("implements IAIProvider contracts", () => {
    const provider = createOpenAIProvider({
      configuration: createProviderConfiguration(),
      client: createMockTransport(),
      registeredAt: FIXED_TIMESTAMP,
    });

    expect(provider.id).toBe(AIProviderIds.OPENAI);
    expect(provider.getCapabilities().chat).toBe(true);
    expect(provider.getCapabilities().streaming).toBe(false);
    expect(provider.supports("chat")).toBe(true);
    expect(provider.supportsStreaming()).toBe(false);
    expect(provider.getInfo().displayName).toBe("OpenAI");
    expect(provider.listModels().length).toBeGreaterThan(0);
    expect(provider.getModel("gpt-4o-mini")?.available).toBe(true);
  });

  it("execute maps PromptPackage to AIResponse via mocked client", async () => {
    const provider = createOpenAIProvider({
      configuration: createProviderConfiguration(),
      client: createMockTransport(
        createOpenAIResponseFixture({ content: "Coach answer" }),
      ),
    });

    const response = await provider.execute({
      promptPackage: createPromptPackageFixture(),
      requestId: "req-exec-1",
      executedAt: FIXED_TIMESTAMP,
    });

    expect(response.content).toBe("Coach answer");
    expect(response.providerId).toBe(AIProviderIds.OPENAI);
    expect(response.requestId).toBe("req-exec-1");
    expect(Object.isFrozen(response)).toBe(true);
  });

  it("execute fails without API key", async () => {
    const provider = createOpenAIProvider({
      configuration: createProviderConfiguration({
        client: createClientOptions({ apiKey: "" }),
        enabled: false,
      }),
      client: createMockTransport(),
    });

    await expect(
      provider.execute({
        promptPackage: createPromptPackageFixture(),
      }),
    ).rejects.toBeInstanceOf(AIProviderError);
  });

  it("health reports healthy when configured", async () => {
    const provider = createOpenAIProvider({
      configuration: createProviderConfiguration(),
      client: createMockTransport(),
    });

    const health = await provider.health();
    expect(health.healthy).toBe(true);
    expect(health.providerId).toBe(AIProviderIds.OPENAI);
    expect(provider.getHealth().healthy).toBe(true);
  });

  it("rejects streaming execution options when streaming disabled", async () => {
    const provider = createOpenAIProvider({
      configuration: createProviderConfiguration({ streaming: false }),
      client: createMockTransport(),
    });

    await expect(
      provider.execute({
        promptPackage: createPromptPackageFixture(),
        options: {
          temperature: 0.5,
          maxOutputTokens: 100,
          topP: null,
          stopSequences: Object.freeze([]),
          stream: true,
          timeoutMs: null,
          retryLimit: null,
          attributes: Object.freeze({}),
        },
      }),
    ).rejects.toMatchObject({
      code: "openai_execution_options_streaming_not_supported",
    });
  });

  it("executeStreaming yields chunks when streaming enabled", async () => {
    const provider = createOpenAIProvider({
      configuration: createProviderConfiguration({ streaming: true }),
      client: createMockTransport(
        createOpenAIResponseFixture({ content: "Hi" }),
      ),
    });

    expect(provider.supportsStreaming()).toBe(true);
    expect(provider.getCapabilities().streaming).toBe(true);

    const deltas: string[] = [];
    for await (const chunk of provider.executeStreaming({
      promptPackage: createPromptPackageFixture(),
      requestId: "stream-req",
      executedAt: FIXED_TIMESTAMP,
    })) {
      deltas.push(chunk.delta);
      expect(chunk.requestId).toBe("stream-req");
    }

    expect(deltas.join("")).toBe("Hi");
  });
});
