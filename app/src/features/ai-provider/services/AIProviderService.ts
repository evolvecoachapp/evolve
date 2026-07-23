import type { PromptPackage } from "../../prompt-composition/models/PromptPackage";
import type { IAIProvider } from "../contracts/IAIProvider";
import type { IAIProviderRegistry } from "../contracts/IAIProviderRegistry";
import {
  createAIProviderEngine,
  AIProviderEngine,
  type PrepareAIRequestInput,
} from "../engine/AIProviderEngine";
import { createAIProviderFactory } from "../factory/AIProviderFactory";
import type { AIProviderFactory } from "../factory/AIProviderFactory";
import type { AIExecutionContext } from "../models/AIExecutionContext";
import type { AIExecutionOptions } from "../models/AIExecutionOptions";
import type { AIModel } from "../models/AIModel";
import type { AIProvider } from "../models/AIProvider";
import type { AIProviderId } from "../models/AIProviderId";
import type { AIProviderMetadata } from "../models/AIProviderMetadata";
import type { AIProviderResult } from "../models/AIProviderResult";
import type { AIProviderSnapshot } from "../models/AIProviderSnapshot";
import type { AIRequest } from "../models/AIRequest";
import type { AIResponse } from "../models/AIResponse";
import { createProviderRegistry } from "../registry/ProviderRegistry";
import type { ProviderRegistry } from "../registry/ProviderRegistry";
import type { ProviderDescriptor } from "../models/ProviderDescriptor";
import {
  buildProviderStatistics,
  toProviderFeatures,
} from "../utils/statisticsHelpers";
import { freezeProviderResult } from "../utils/freezeObjects";
import { validateProviderRegistration } from "../validators/validateProviderRegistration";
import { validateResponseIntegrity } from "../validators/validateResponseIntegrity";

/**
 * Service facade over AIProviderEngine + Factory + metadata registries.
 * Hides engine internals from application consumers.
 */
export class AIProviderService {
  private readonly factory: AIProviderFactory;
  private readonly providerRegistry: ProviderRegistry;

  constructor(
    private readonly engine: AIProviderEngine = createAIProviderEngine(),
    factory?: AIProviderFactory,
    providerRegistry?: ProviderRegistry,
  ) {
    this.factory = factory ?? createAIProviderFactory(engine.getRegistry());
    this.providerRegistry =
      providerRegistry ?? createProviderRegistry(engine.getRegistry());
  }

  getRegistry(): IAIProviderRegistry {
    return this.engine.getRegistry();
  }

  getFactory(): AIProviderFactory {
    return this.factory;
  }

  getProviderRegistry(): ProviderRegistry {
    return this.providerRegistry;
  }

  /** Alias — PromptPackage → immutable AIRequest. */
  createAIRequest(options: {
    readonly promptPackage: PromptPackage;
    readonly providerId?: AIProviderId | null;
    readonly model?: AIModel | null;
    readonly options?: AIExecutionOptions;
    readonly metadata?: AIProviderMetadata;
    readonly requestId?: string;
    readonly createdAt?: string;
  }): AIRequest {
    return this.prepareAIRequest(options);
  }

  prepareAIRequest(options: {
    readonly promptPackage: PromptPackage;
    readonly providerId?: AIProviderId | null;
    readonly model?: AIModel | null;
    readonly options?: AIExecutionOptions;
    readonly metadata?: AIProviderMetadata;
    readonly requestId?: string;
    readonly createdAt?: string;
  }): AIRequest {
    return this.engine.prepareRequest(options);
  }

  validateProvider(providerId: AIProviderId): readonly string[] {
    const provider = this.engine.getRegistry().resolve(providerId);
    if (!provider) {
      return Object.freeze([`provider_not_registered:${providerId}`]);
    }
    return validateProviderRegistration(provider);
  }

  resolveProvider(providerId: AIProviderId): IAIProvider {
    return this.engine.resolveProvider(providerId);
  }

  listProviders(): readonly IAIProvider[] {
    return this.engine.getRegistry().list();
  }

  describeProvider(providerId: AIProviderId): AIProviderSnapshot | null {
    const provider = this.engine.getRegistry().resolve(providerId);
    if (!provider) {
      return null;
    }

    const info = provider.getInfo();
    const descriptor = this.providerRegistry.describe(providerId);
    return Object.freeze({
      id: `snapshot:${info.id}`,
      provider: info,
      features: toProviderFeatures(info.capabilities),
      statistics: buildProviderStatistics({
        modelCount: info.models.length,
        capabilities: info.capabilities,
        lastUsedAt: descriptor?.registeredAt ?? null,
      }),
      capturedAt: info.registeredAt,
    });
  }

  describeProviderDescriptor(
    providerId: AIProviderId,
  ): ProviderDescriptor | null {
    return this.providerRegistry.describe(providerId);
  }

  createExecutionContext(options: {
    readonly request: AIRequest;
    readonly providerId?: AIProviderId | null;
    readonly contextId?: string;
    readonly preparedAt?: string;
  }): AIExecutionContext {
    return this.engine.createExecutionContext(options);
  }

  prepare(options: PrepareAIRequestInput & {
    readonly requireProvider?: boolean;
    readonly contextId?: string;
    readonly preparedAt?: string;
  }): AIProviderResult {
    return this.engine.prepare(options);
  }

  /**
   * Wrap a standardized AIResponse into an AIProviderResult (no networking).
   */
  fromResponse(options: {
    readonly request: AIRequest;
    readonly response: AIResponse;
    readonly provider?: AIProvider | null;
    readonly context?: AIExecutionContext | null;
    readonly preparedAt?: string;
  }): AIProviderResult {
    const responseIssues = validateResponseIntegrity(options.response);
    return freezeProviderResult({
      request: options.request,
      provider: options.provider ?? null,
      context: options.context ?? null,
      response: options.response,
      validationIssues: Object.freeze([...responseIssues]),
      preparedAt: options.preparedAt ?? options.response.createdAt,
    });
  }
}

export function createAIProviderService(
  engine?: AIProviderEngine,
  factory?: AIProviderFactory,
  providerRegistry?: ProviderRegistry,
): AIProviderService {
  return new AIProviderService(engine, factory, providerRegistry);
}
