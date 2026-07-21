import { AIConfigurationFactory } from "../../../../ai-config/factory";
import { HttpClient, type FetchLike } from "../../../../http/client/HttpClient";
import { AIError } from "../../../models/AIError";
import { createAIRequest } from "../../../testSupport/fixtures";
import { OpenAIProvider } from "../OpenAIProvider";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

function createProvider(fetchImpl: FetchLike) {
  const configuration = AIConfigurationFactory.createDefault({
    providerType: "openai",
    apiKey: "sk-test",
    modelId: "gpt-4o-mini",
    timeoutMs: 5_000,
    maxRetries: 1,
    maxOutputTokens: 256,
  });

  const httpClient = new HttpClient({
    fetchImpl,
    defaultMaxRetries: 0,
    sleep: async () => undefined,
  });

  return new OpenAIProvider(httpClient, configuration);
}

describe("OpenAIProvider", () => {
  it("generates AIResponse through HttpClient Chat Completions", async () => {
    const fetchImpl: FetchLike = jest.fn(async (url, init) => {
      expect(String(url)).toBe("https://api.openai.com/v1/chat/completions");
      expect(init?.method).toBe("POST");
      const headers = init?.headers as Record<string, string>;
      expect(headers.Authorization).toBe("Bearer sk-test");

      const body = JSON.parse(String(init?.body));
      expect(body.model).toBe("gpt-4o-mini");
      expect(body.stream).toBe(false);
      expect(body.max_tokens).toBe(256);

      return jsonResponse(200, {
        id: "chatcmpl-abc",
        model: "gpt-4o-mini",
        choices: [
          {
            index: 0,
            message: { role: "assistant", content: "Rest and recover." },
            finish_reason: "stop",
          },
        ],
        usage: {
          prompt_tokens: 12,
          completion_tokens: 8,
          total_tokens: 20,
        },
      });
    });

    const provider = createProvider(fetchImpl);
    const response = await provider.generateResponse(createAIRequest());

    expect(response.message.content).toBe("Rest and recover.");
    expect(response.provider).toBe("openai");
    expect(response.finishReason).toBe("stop");
    expect(response.usage.totalTokens).toBe(20);
    expect(provider.getProviderInfo().name).toBe("OpenAI");
  });

  it("maps HTTP errors to AIError and never exposes HttpError", async () => {
    const fetchImpl: FetchLike = jest.fn(async () =>
      jsonResponse(401, { error: { message: "invalid key" } }),
    );

    const provider = createProvider(fetchImpl);

    await expect(
      provider.generateResponse(createAIRequest()),
    ).rejects.toMatchObject({
      name: "AIError",
      code: "authentication_failed",
      providerType: "openai",
    });
  });

  it("throws authentication_failed when api key is missing", async () => {
    const configuration = AIConfigurationFactory.createDefault({
      providerType: "openai",
      apiKey: null,
      modelId: "gpt-4o-mini",
    });
    const provider = new OpenAIProvider(new HttpClient(), configuration);

    await expect(
      provider.generateResponse(createAIRequest()),
    ).rejects.toMatchObject({
      code: "authentication_failed",
    });
  });

  it("healthCheck performs lightweight model lookup", async () => {
    const fetchImpl: FetchLike = jest.fn(async (url, init) => {
      expect(String(url)).toBe(
        "https://api.openai.com/v1/models/gpt-4o-mini",
      );
      expect(init?.method).toBe("GET");
      return jsonResponse(200, { id: "gpt-4o-mini" });
    });

    const provider = createProvider(fetchImpl);
    await expect(provider.healthCheck()).resolves.toBe(true);
  });

  it("healthCheck returns false on failure", async () => {
    const fetchImpl: FetchLike = jest.fn(async () =>
      jsonResponse(503, { error: "down" }),
    );

    const provider = createProvider(fetchImpl);
    await expect(provider.healthCheck()).resolves.toBe(false);
  });

  it("uses constructor DI — no singleton", () => {
    const fetchImpl: FetchLike = jest.fn();
    const first = createProvider(fetchImpl);
    const second = createProvider(fetchImpl);
    expect(first).not.toBe(second);
  });

  it("does not use the OpenAI SDK", async () => {
    // Guard: provider path must go through injected HttpClient only.
    const fetchImpl: FetchLike = jest.fn(async () =>
      jsonResponse(200, {
        choices: [
          {
            index: 0,
            message: { role: "assistant", content: "ok" },
            finish_reason: "stop",
          },
        ],
        usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 },
      }),
    );

    const provider = createProvider(fetchImpl);
    await provider.generateResponse(createAIRequest());
    expect(fetchImpl).toHaveBeenCalled();
    expect(AIError).toBeDefined();
  });
});
