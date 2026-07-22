import type { AIExecutionContext } from "../models/AIExecutionContext";
import type { AIExecutionOptions } from "../models/AIExecutionOptions";
import type { AIModel } from "../models/AIModel";
import type { AIModelInfo } from "../models/AIModelInfo";
import type { AIProvider } from "../models/AIProvider";
import type { AIProviderCapabilities } from "../models/AIProviderCapabilities";
import type { AIProviderConfiguration } from "../models/AIProviderConfiguration";
import type { AIProviderHealth } from "../models/AIProviderHealth";
import type { AIProviderLimits } from "../models/AIProviderLimits";
import type { AIProviderMetadata } from "../models/AIProviderMetadata";
import type { AIProviderResult } from "../models/AIProviderResult";
import type { AIRequest } from "../models/AIRequest";
import type { AIResponse } from "../models/AIResponse";
import type { AIResponseChunk } from "../models/AIResponseChunk";
import type { AITokenUsage } from "../models/AITokenUsage";

export function freezeMetadata(
  metadata: AIProviderMetadata,
): AIProviderMetadata {
  return Object.freeze({
    tags: Object.freeze([...metadata.tags]),
    attributes: Object.freeze({ ...metadata.attributes }),
  });
}

export function freezeCapabilities(
  capabilities: AIProviderCapabilities,
): AIProviderCapabilities {
  return Object.freeze({ ...capabilities });
}

export function freezeLimits(limits: AIProviderLimits): AIProviderLimits {
  return Object.freeze({ ...limits });
}

export function freezeConfiguration(
  configuration: AIProviderConfiguration,
): AIProviderConfiguration {
  return Object.freeze({
    ...configuration,
    preferredModelIds: Object.freeze([...configuration.preferredModelIds]),
    limits: freezeLimits(configuration.limits),
    metadata: freezeMetadata(configuration.metadata),
  });
}

export function freezeHealth(health: AIProviderHealth): AIProviderHealth {
  return Object.freeze({
    ...health,
    details: Object.freeze({ ...health.details }),
  });
}

export function freezeModel(model: AIModel): AIModel {
  return Object.freeze({ ...model });
}

export function freezeModelInfo(model: AIModelInfo): AIModelInfo {
  return Object.freeze({
    ...model,
    capabilities: freezeCapabilities(model.capabilities),
    limits: freezeLimits(model.limits),
    metadata: freezeMetadata(model.metadata),
  });
}

export function freezeExecutionOptions(
  options: AIExecutionOptions,
): AIExecutionOptions {
  return Object.freeze({
    ...options,
    stopSequences: Object.freeze([...options.stopSequences]),
    attributes: Object.freeze({ ...options.attributes }),
  });
}

export function freezeTokenUsage(usage: AITokenUsage): AITokenUsage {
  return Object.freeze({ ...usage });
}

export function freezeProvider(provider: AIProvider): AIProvider {
  return Object.freeze({
    ...provider,
    capabilities: freezeCapabilities(provider.capabilities),
    configuration: freezeConfiguration(provider.configuration),
    health: provider.health ? freezeHealth(provider.health) : null,
    models: Object.freeze(provider.models.map(freezeModelInfo)),
    metadata: freezeMetadata(provider.metadata),
  });
}

export function freezeRequest(request: AIRequest): AIRequest {
  return Object.freeze({
    ...request,
    model: request.model ? freezeModel(request.model) : null,
    options: freezeExecutionOptions(request.options),
    metadata: freezeMetadata(request.metadata),
  });
}

export function freezeResponse(response: AIResponse): AIResponse {
  return Object.freeze({
    ...response,
    usage: freezeTokenUsage(response.usage),
    metadata: freezeMetadata(response.metadata),
  });
}

export function freezeResponseChunk(chunk: AIResponseChunk): AIResponseChunk {
  return Object.freeze({
    ...chunk,
    usage: chunk.usage ? freezeTokenUsage(chunk.usage) : null,
  });
}

export function freezeExecutionContext(
  context: AIExecutionContext,
): AIExecutionContext {
  return Object.freeze({
    ...context,
    provider: freezeProvider(context.provider),
    request: freezeRequest(context.request),
    options: freezeExecutionOptions(context.options),
    validationIssues: Object.freeze([...context.validationIssues]),
  });
}

export function freezeProviderResult(
  result: AIProviderResult,
): AIProviderResult {
  return Object.freeze({
    request: freezeRequest(result.request),
    provider: result.provider ? freezeProvider(result.provider) : null,
    context: result.context ? freezeExecutionContext(result.context) : null,
    response: result.response ? freezeResponse(result.response) : null,
    validationIssues: Object.freeze([...result.validationIssues]),
    preparedAt: result.preparedAt,
  });
}
