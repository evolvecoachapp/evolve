import { AIProviderIds } from "../../ai-provider/models/AIProviderId";
import { createAIProviderRegistry } from "../../ai-provider/registry/AIProviderRegistry";
import {
  createPromptPackageFixture,
  createStubProvider,
  FIXED_TIMESTAMP as PROVIDER_FIXED_TIMESTAMP,
} from "../../ai-provider/testSupport/fixtures";
import type { AIResponse } from "../../ai-provider/models/AIResponse";
import { AIFinishReasons } from "../../ai-provider/models/AIFinishReason";
import { EMPTY_PROVIDER_METADATA } from "../../ai-provider/models/AIProviderMetadata";
import { DEFAULT_EXECUTION_OPTIONS } from "../../ai-provider/models/AIExecutionOptions";
import {
  createMockTransport,
  createOpenAIResponseFixture,
  createProviderConfiguration,
} from "../../openai-provider/testSupport/fixtures";
import { createOpenAIProvider } from "../../openai-provider/provider/OpenAIProvider";
import type {
  AIProviderExecuteInput,
  IAIProviderExecutor,
  IAIProviderExecutorResolver,
} from "../contracts/IAIProviderExecutor";
import { AIExecutionRequestBuilder } from "../builders/AIExecutionRequestBuilder";
import type { AIExecutionRequest } from "../models/AIExecutionRequest";
import { createAIExecutionPipeline } from "../pipeline/AIExecutionPipeline";
import { createAIExecutionService } from "../services/AIExecutionService";

export const FIXED_TIMESTAMP = PROVIDER_FIXED_TIMESTAMP;

export { createPromptPackageFixture, createStubProvider };

export function createAIResponseFixture(
  overrides: Partial<AIResponse> = {},
): AIResponse {
  return Object.freeze({
    id: overrides.id ?? "ai-response:fixture",
    requestId: overrides.requestId ?? "ai-exec-req:fixture",
    providerId: overrides.providerId ?? "test-provider",
    modelId: overrides.modelId ?? "test-model",
    content: overrides.content ?? "Hello from execution fixture.",
    finishReason: overrides.finishReason ?? AIFinishReasons.STOP,
    usage: overrides.usage ??
      Object.freeze({
        promptTokens: 10,
        completionTokens: 5,
        totalTokens: 15,
      }),
    metadata: overrides.metadata ?? EMPTY_PROVIDER_METADATA,
    createdAt: overrides.createdAt ?? FIXED_TIMESTAMP,
  });
}

export function createStubExecutor(
  options: {
    readonly providerId?: string;
    readonly response?: AIResponse;
    readonly error?: Error;
    readonly onExecute?: (input: AIProviderExecuteInput) => void;
  } = {},
): IAIProviderExecutor {
  const providerId = options.providerId ?? "test-provider";
  return {
    providerId,
    async execute(input: AIProviderExecuteInput): Promise<AIResponse> {
      options.onExecute?.(input);
      if (options.error) {
        throw options.error;
      }
      return (
        options.response ??
        createAIResponseFixture({
          requestId: input.requestId ?? "ai-exec-req:fixture",
          providerId,
          createdAt: input.executedAt ?? FIXED_TIMESTAMP,
        })
      );
    },
  };
}

export function createExecutorResolver(
  executors: readonly IAIProviderExecutor[],
): IAIProviderExecutorResolver {
  const map = new Map(
    executors.map((executor) => [executor.providerId, executor]),
  );
  return {
    resolve(providerId) {
      return map.get(providerId) ?? null;
    },
  };
}

export function createExecutionRequestFixture(
  overrides: Partial<AIExecutionRequest> & {
    readonly providerId?: string;
  } = {},
): AIExecutionRequest {
  const promptPackage =
    overrides.promptPackage ??
    createPromptPackageFixture({ id: "prompt-package:execution" });

  return new AIExecutionRequestBuilder()
    .withId(overrides.id ?? "ai-exec-req:fixture")
    .withPromptPackage(promptPackage)
    .withProviderId(overrides.providerId ?? "test-provider")
    .withModelId(overrides.modelId ?? "test-model")
    .withOptions(overrides.options ?? DEFAULT_EXECUTION_OPTIONS)
    .withMetadata(
      overrides.metadata ??
        Object.freeze({
          tags: Object.freeze(["test"]),
          attributes: Object.freeze({}),
        }),
    )
    .withPolicy(
      overrides.policy ??
        Object.freeze({
          retry: Object.freeze({
            enabled: false,
            maxAttempts: null,
            backoffMs: null,
          }),
          timeout: Object.freeze({
            enabled: false,
            timeoutMs: null,
          }),
          cancellation: Object.freeze({
            enabled: false,
            token: null,
          }),
          execution: Object.freeze({
            allowStreaming: false,
            allowTools: false,
            requireProvider: true,
          }),
        }),
    )
    .withCancellation(
      overrides.cancellation ??
        Object.freeze({
          requested: false,
          token: null,
          reason: null,
          requestedAt: null,
        }),
    )
    .withTimeout(
      overrides.timeout ??
        Object.freeze({
          enabled: false,
          timeoutMs: null,
          timedOut: false,
          elapsedMs: null,
        }),
    )
    .withCreatedAt(overrides.createdAt ?? FIXED_TIMESTAMP)
    .build();
}

export function createTestExecutionHarness(
  options: {
    readonly providerId?: string;
    readonly response?: AIResponse;
    readonly executorError?: Error;
  } = {},
) {
  const providerId = options.providerId ?? "test-provider";
  const registry = createAIProviderRegistry();
  registry.register(createStubProvider({ id: providerId }));

  const executor = createStubExecutor({
    providerId,
    response: options.response,
    error: options.executorError,
  });
  const executorResolver = createExecutorResolver([executor]);

  const pipeline = createAIExecutionPipeline({
    registry,
    executorResolver,
    clock: () => FIXED_TIMESTAMP,
  });

  const service = createAIExecutionService({
    registry,
    executorResolver,
    clock: () => FIXED_TIMESTAMP,
  });

  return Object.freeze({
    registry,
    executor,
    executorResolver,
    pipeline,
    service,
    providerId,
  });
}

/**
 * Integration harness wiring OpenAI provider through a provider-agnostic executor.
 * Does not modify openai-provider — wraps execute() only.
 */
export function createOpenAIExecutionHarness(
  options: { readonly content?: string } = {},
) {
  const configuration = createProviderConfiguration();
  const client = createMockTransport(
    createOpenAIResponseFixture({ content: options.content ?? "openai via pipeline" }),
  );
  const openAIProvider = createOpenAIProvider({
    configuration,
    client,
    registeredAt: FIXED_TIMESTAMP,
  });

  const registry = createAIProviderRegistry();
  registry.register(openAIProvider);

  const executor: IAIProviderExecutor = {
    providerId: AIProviderIds.OPENAI,
    execute: (input) => openAIProvider.execute(input),
  };

  const executorResolver = createExecutorResolver([executor]);
  const service = createAIExecutionService({
    registry,
    executorResolver,
    clock: () => FIXED_TIMESTAMP,
  });

  return Object.freeze({
    registry,
    openAIProvider,
    executorResolver,
    service,
    providerId: AIProviderIds.OPENAI,
  });
}

// Re-export openai test helpers used by integration tests
export {
  createMockTransport,
  createOpenAIResponseFixture,
  createProviderConfiguration,
};
