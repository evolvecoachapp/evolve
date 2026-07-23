import { createPromptPackageFixture } from "../../prompt-composition/testSupport/fixtures";
import type { OpenAIChatTransport } from "../client/OpenAIClient";
import { OpenAIResponseBuilder } from "../builders/OpenAIResponseBuilder";
import type { OpenAIClientOptions } from "../models/OpenAIClientOptions";
import {
  DEFAULT_OPENAI_MAX_RETRIES,
  DEFAULT_OPENAI_TIMEOUT_MS,
  OPENAI_API_BASE_URL,
  DEFAULT_OPENAI_RETRY_POLICY,
} from "../models/OpenAIClientOptions";
import { DEFAULT_OPENAI_MODELS } from "../models/OpenAIModelConfiguration";
import type { OpenAIProviderConfiguration } from "../models/OpenAIProviderConfiguration";
import {
  DEFAULT_OPENAI_MODEL,
  DEFAULT_OPENAI_TEMPERATURE,
  DEFAULT_OPENAI_TOP_P,
} from "../models/OpenAIProviderConfiguration";
import type { OpenAIRequest } from "../models/OpenAIRequest";
import type { OpenAIResponse } from "../models/OpenAIResponse";
import type { OpenAIStreamChunk } from "../models/OpenAIStreamChunk";
import { freezeProviderConfiguration } from "../utils/freezeObjects";

export const FIXED_TIMESTAMP = "2026-07-23T00:00:00.000Z";

export { createPromptPackageFixture };

export function createClientOptions(
  overrides: Partial<OpenAIClientOptions> = {},
): OpenAIClientOptions {
  return Object.freeze({
    apiKey: overrides.apiKey ?? "test-openai-key",
    baseURL: overrides.baseURL ?? OPENAI_API_BASE_URL,
    timeoutMs: overrides.timeoutMs ?? DEFAULT_OPENAI_TIMEOUT_MS,
    organization: overrides.organization ?? null,
    project: overrides.project ?? null,
    maxRetries: overrides.maxRetries ?? DEFAULT_OPENAI_MAX_RETRIES,
    retryPolicy: overrides.retryPolicy ?? DEFAULT_OPENAI_RETRY_POLICY,
  });
}

export function createProviderConfiguration(
  overrides: Partial<OpenAIProviderConfiguration> = {},
): OpenAIProviderConfiguration {
  return freezeProviderConfiguration({
    enabled: overrides.enabled ?? true,
    defaultModelId: overrides.defaultModelId ?? DEFAULT_OPENAI_MODEL,
    models: overrides.models ?? DEFAULT_OPENAI_MODELS,
    client: overrides.client ?? createClientOptions(),
    defaultTemperature:
      overrides.defaultTemperature ?? DEFAULT_OPENAI_TEMPERATURE,
    defaultTopP: overrides.defaultTopP ?? DEFAULT_OPENAI_TOP_P,
    defaultMaxOutputTokens: overrides.defaultMaxOutputTokens ?? 1024,
    streaming: overrides.streaming ?? false,
    retryPolicy: overrides.retryPolicy ?? DEFAULT_OPENAI_RETRY_POLICY,
  });
}

export function createOpenAIResponseFixture(
  overrides: Partial<OpenAIResponse> & { readonly content?: string } = {},
): OpenAIResponse {
  const content = overrides.content ?? "Hello from OpenAI fixture.";
  return new OpenAIResponseBuilder()
    .withId(overrides.id ?? "chatcmpl-fixture")
    .withModel(overrides.model ?? DEFAULT_OPENAI_MODEL)
    .withChoices(
      overrides.choices ??
        Object.freeze([
          Object.freeze({
            index: 0,
            message: Object.freeze({
              role: "assistant" as const,
              content,
            }),
            finishReason: "stop",
          }),
        ]),
    )
    .withUsage(
      overrides.usage ??
        Object.freeze({
          promptTokens: 12,
          completionTokens: 8,
          totalTokens: 20,
        }),
    )
    .withCreatedAt(overrides.createdAt ?? FIXED_TIMESTAMP)
    .withRawFinishReason(overrides.rawFinishReason ?? "stop")
    .build();
}

export function createMockTransport(
  response: OpenAIResponse = createOpenAIResponseFixture(),
  onRequest?: (request: OpenAIRequest) => void,
  streamChunks?: readonly OpenAIStreamChunk[],
): OpenAIChatTransport {
  return {
    async createChatCompletion(request: OpenAIRequest): Promise<OpenAIResponse> {
      onRequest?.(request);
      return response;
    },
    async *createChatCompletionStream(
      request: OpenAIRequest,
    ): AsyncIterable<OpenAIStreamChunk> {
      onRequest?.(request);
      const chunks =
        streamChunks ??
        Object.freeze([
          Object.freeze({
            id: "chatcmpl-stream",
            index: 0,
            delta: response.choices[0]?.message.content ?? "",
            finishReason: "stop",
            model: response.model,
            usage: response.usage,
            createdAt: FIXED_TIMESTAMP,
          }),
        ]);
      for (const chunk of chunks) {
        yield chunk;
      }
    },
  };
}
