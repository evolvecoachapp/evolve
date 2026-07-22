import type { PromptPackage } from "../../prompt-composition/models/PromptPackage";
import { AIExecutionContextBuilder } from "../builders/AIExecutionContextBuilder";
import { AIRequestBuilder } from "../builders/AIRequestBuilder";
import type { IAIProvider } from "../contracts/IAIProvider";
import type { IAIProviderRegistry } from "../contracts/IAIProviderRegistry";
import type { AIExecutionContext } from "../models/AIExecutionContext";
import type { AIExecutionOptions } from "../models/AIExecutionOptions";
import { DEFAULT_EXECUTION_OPTIONS } from "../models/AIExecutionOptions";
import type { AIModel } from "../models/AIModel";
import { AIProviderError } from "../models/AIProviderError";
import type { AIProviderId } from "../models/AIProviderId";
import type { AIProviderMetadata } from "../models/AIProviderMetadata";
import { EMPTY_PROVIDER_METADATA } from "../models/AIProviderMetadata";
import type { AIProviderResult } from "../models/AIProviderResult";
import type { AIRequest } from "../models/AIRequest";
import {
  createAIProviderRegistry,
} from "../registry/AIProviderRegistry";
import { freezeProviderResult } from "../utils/freezeObjects";
import { normalizeProviderId } from "../utils/normalizeProviderId";
import {
  validateConfiguration,
  validateExecutionOptions,
  validateModelSelection,
  validateProviderId,
  validateRequestIntegrity,
} from "../validators";

const DEFAULT_PREPARED_AT = "2026-07-23T00:00:00.000Z";

export interface AIProviderEngineDeps {
  readonly registry?: IAIProviderRegistry;
}

export interface PrepareAIRequestInput {
  readonly promptPackage: PromptPackage;
  readonly providerId?: AIProviderId | null;
  readonly model?: AIModel | null;
  readonly options?: AIExecutionOptions;
  readonly metadata?: AIProviderMetadata;
  readonly requestId?: string;
  readonly createdAt?: string;
}

/**
 * AI Provider Engine — orchestration primitives only.
 *
 * Validate requests → resolve provider → prepare execution context →
 * return provider contract. Does NOT execute providers or perform HTTP.
 */
export class AIProviderEngine {
  private readonly registry: IAIProviderRegistry;

  constructor(deps: AIProviderEngineDeps = {}) {
    this.registry = deps.registry ?? createAIProviderRegistry();
  }

  getRegistry(): IAIProviderRegistry {
    return this.registry;
  }

  /**
   * Prepare an immutable AIRequest from a PromptPackage.
   */
  prepareRequest(input: PrepareAIRequestInput): AIRequest {
    if (!input.promptPackage) {
      throw new AIProviderError(
        "missing_prompt_package",
        "PromptPackage is required",
      );
    }

    const createdAt = input.createdAt ?? DEFAULT_PREPARED_AT;
    const requestId =
      input.requestId ??
      `ai-request:${input.promptPackage.id}:${createdAt}`;

    const providerId = input.providerId
      ? normalizeProviderId(input.providerId)
      : null;

    return new AIRequestBuilder()
      .withId(requestId)
      .withPromptPackage(input.promptPackage)
      .withProviderId(providerId)
      .withModel(input.model ?? null)
      .withOptions(input.options ?? DEFAULT_EXECUTION_OPTIONS)
      .withMetadata(input.metadata ?? EMPTY_PROVIDER_METADATA)
      .withCreatedAt(createdAt)
      .build();
  }

  /**
   * Resolve a provider contract from the registry.
   * Hard-fails when id is missing/invalid or provider is unavailable.
   */
  resolveProvider(providerId: AIProviderId): IAIProvider {
    const idIssues = validateProviderId(providerId);
    if (idIssues.length > 0) {
      throw new AIProviderError(
        "invalid_provider_id",
        `Invalid provider id: ${idIssues.join(", ")}`,
        providerId,
      );
    }

    const normalizedId = normalizeProviderId(providerId);
    const availabilityIssues =
      this.registry.validateAvailability(normalizedId);
    if (availabilityIssues.length > 0) {
      throw new AIProviderError(
        "provider_unavailable",
        `Provider unavailable: ${availabilityIssues.join(", ")}`,
        normalizedId,
      );
    }

    const provider = this.registry.resolve(normalizedId);
    if (!provider) {
      throw new AIProviderError(
        "provider_not_found",
        `Provider not found: ${normalizedId}`,
        normalizedId,
      );
    }

    return provider;
  }

  /**
   * Prepare an immutable execution context for a resolved provider.
   * Does not execute the provider.
   */
  createExecutionContext(options: {
    readonly request: AIRequest;
    readonly providerId?: AIProviderId | null;
    readonly contextId?: string;
    readonly preparedAt?: string;
  }): AIExecutionContext {
    const softIssues = [...validateRequestIntegrity(options.request)];

    const providerId =
      options.providerId ?? options.request.providerId ?? null;
    if (!providerId) {
      throw new AIProviderError(
        "missing_provider_id",
        "Provider id is required to create execution context",
      );
    }

    const provider = this.resolveProvider(providerId);
    const descriptor = provider.getInfo();

    softIssues.push(...validateConfiguration(provider.getConfiguration()));
    softIssues.push(...validateExecutionOptions(options.request.options));
    softIssues.push(
      ...validateModelSelection({
        model: options.request.model,
        provider: descriptor,
        configuration: provider.getConfiguration(),
      }),
    );

    const preparedAt = options.preparedAt ?? DEFAULT_PREPARED_AT;
    const contextId =
      options.contextId ??
      `ai-execution:${options.request.id}:${provider.id}`;

    return new AIExecutionContextBuilder()
      .withId(contextId)
      .withRequest(options.request)
      .withProvider(descriptor)
      .withOptions(options.request.options)
      .withPreparedAt(preparedAt)
      .withValidationIssues(Object.freeze([...new Set(softIssues)]))
      .build();
  }

  /**
   * Full prepare → resolve → context orchestration (no execution).
   */
  prepare(options: PrepareAIRequestInput & {
    readonly requireProvider?: boolean;
    readonly contextId?: string;
    readonly preparedAt?: string;
  }): AIProviderResult {
    const preparedAt = options.preparedAt ?? DEFAULT_PREPARED_AT;
    const request = this.prepareRequest({
      ...options,
      createdAt: options.createdAt ?? preparedAt,
    });

    const softIssues = [...validateRequestIntegrity(request)];
    let providerContract: IAIProvider | null = null;
    let context: AIExecutionContext | null = null;

    const providerId = request.providerId;
    const requireProvider = options.requireProvider ?? Boolean(providerId);

    if (requireProvider) {
      if (!providerId) {
        throw new AIProviderError(
          "missing_provider_id",
          "Provider id is required when requireProvider is true",
        );
      }
      providerContract = this.resolveProvider(providerId);
      context = this.createExecutionContext({
        request,
        providerId,
        contextId: options.contextId,
        preparedAt,
      });
      softIssues.push(...context.validationIssues);
    } else if (providerId && this.registry.has(providerId)) {
      try {
        providerContract = this.resolveProvider(providerId);
        context = this.createExecutionContext({
          request,
          providerId,
          contextId: options.contextId,
          preparedAt,
        });
        softIssues.push(...context.validationIssues);
      } catch {
        softIssues.push(`provider_resolution_soft_failed:${providerId}`);
      }
    }

    return freezeProviderResult({
      request,
      provider: providerContract ? providerContract.getInfo() : null,
      context,
      response: null,
      validationIssues: Object.freeze([...new Set(softIssues)]),
      preparedAt,
    });
  }
}

export function createAIProviderEngine(
  deps?: AIProviderEngineDeps,
): AIProviderEngine {
  return new AIProviderEngine(deps);
}
