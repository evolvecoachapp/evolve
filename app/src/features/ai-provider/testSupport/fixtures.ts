import { createPromptPackageFixture } from "../../prompt-composition/testSupport/fixtures";
import type { IAIHealthProvider } from "../contracts/IAIHealthProvider";
import type { IAIModelProvider } from "../contracts/IAIModelProvider";
import type { IAIProvider } from "../contracts/IAIProvider";
import type { IAIStreamingProvider } from "../contracts/IAIStreamingProvider";
import type { AIModelInfo } from "../models/AIModelInfo";
import type { AIProvider } from "../models/AIProvider";
import type { AIProviderCapabilities } from "../models/AIProviderCapabilities";
import type { AIProviderCapabilityKey } from "../models/AIProviderCapabilities";
import type { AIProviderConfiguration } from "../models/AIProviderConfiguration";
import { createDefaultConfiguration } from "../models/AIProviderConfiguration";
import type { AIProviderHealth } from "../models/AIProviderHealth";
import type { AIProviderId } from "../models/AIProviderId";
import type { AIProviderMetadata } from "../models/AIProviderMetadata";
import { EMPTY_PROVIDER_METADATA } from "../models/AIProviderMetadata";
import type { AIProviderStatus } from "../models/AIProviderStatus";
import { AIProviderStatuses } from "../models/AIProviderStatus";
import { freezeCapabilities, freezeProvider } from "../utils/freezeObjects";

export const FIXED_TIMESTAMP = "2026-07-23T00:00:00.000Z";

export { createPromptPackageFixture } from "../../prompt-composition/testSupport/fixtures";

export function createCapabilities(
  overrides: Partial<AIProviderCapabilities> = {},
): AIProviderCapabilities {
  return freezeCapabilities({
    chat: true,
    streaming: false,
    tools: false,
    vision: false,
    audio: false,
    embeddings: false,
    models: true,
    health: true,
    ...overrides,
  });
}

export function createModelInfoFixture(
  overrides: Partial<AIModelInfo> & {
    readonly id?: string;
    readonly providerId?: AIProviderId;
  } = {},
): AIModelInfo {
  const providerId = overrides.providerId ?? "test-provider";
  return Object.freeze({
    id: overrides.id ?? "test-model",
    providerId,
    displayName: overrides.displayName ?? "Test Model",
    family: overrides.family ?? "test",
    version: overrides.version ?? "1",
    capabilities: overrides.capabilities ?? createCapabilities(),
    limits: overrides.limits ??
      Object.freeze({
        maxInputTokens: 8192,
        maxOutputTokens: 2048,
        maxRequestsPerMinute: null,
        maxConcurrentRequests: null,
        maxContextWindow: 8192,
      }),
    metadata: overrides.metadata ?? EMPTY_PROVIDER_METADATA,
    available: overrides.available ?? true,
  });
}

export interface StubProviderOptions {
  readonly id?: AIProviderId;
  readonly displayName?: string;
  readonly status?: AIProviderStatus;
  readonly capabilities?: AIProviderCapabilities;
  readonly configuration?: AIProviderConfiguration;
  readonly models?: readonly AIModelInfo[];
  readonly health?: AIProviderHealth | null;
  readonly metadata?: AIProviderMetadata;
  readonly registeredAt?: string;
}

/**
 * Test double implementing provider contracts.
 * Not a real OpenAI / Anthropic / Gemini / Ollama adapter.
 */
export function createStubProvider(
  options: StubProviderOptions = {},
): IAIProvider & IAIStreamingProvider & IAIHealthProvider & IAIModelProvider {
  const id = options.id ?? "test-provider";
  const capabilities = options.capabilities ?? createCapabilities();
  const configuration =
    options.configuration ??
    Object.freeze({
      ...createDefaultConfiguration(id, options.displayName ?? "Test Provider"),
      defaultModelId: "test-model",
      preferredModelIds: Object.freeze(["test-model"]),
    });
  const models =
    options.models ??
    Object.freeze([createModelInfoFixture({ providerId: id })]);
  const metadata = options.metadata ?? EMPTY_PROVIDER_METADATA;
  const status = options.status ?? AIProviderStatuses.AVAILABLE;
  const health =
    options.health === undefined
      ? Object.freeze({
          providerId: id,
          status,
          healthy: status === AIProviderStatuses.AVAILABLE,
          checkedAt: FIXED_TIMESTAMP,
          message: null,
          details: Object.freeze({}),
        })
      : options.health;
  const registeredAt = options.registeredAt ?? FIXED_TIMESTAMP;

  const getInfo = (): AIProvider =>
    freezeProvider({
      id,
      displayName: configuration.displayName,
      status,
      capabilities,
      configuration,
      health,
      models,
      metadata,
      registeredAt,
    });

  return {
    id,
    getInfo,
    getCapabilities: () => capabilities,
    getConfiguration: () => configuration,
    getMetadata: () => metadata,
    getStatus: () => status,
    supports: (capability: AIProviderCapabilityKey) => capabilities[capability],
    supportsStreaming: () => capabilities.streaming,
    getHealth: () => {
      if (!health) {
        return Object.freeze({
          providerId: id,
          status,
          healthy: false,
          checkedAt: null,
          message: "no health snapshot",
          details: Object.freeze({}),
        });
      }
      return health;
    },
    listModels: () => models,
    getModel: (modelId: string) =>
      models.find((model) => model.id === modelId) ?? null,
  };
}

export function createPreparedPromptPackage(
  overrides: { readonly id?: string } = {},
) {
  return createPromptPackageFixture({
    id: overrides.id ?? "prompt-package:ai-provider",
  });
}
