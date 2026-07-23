import type { PromptPackage } from "../../prompt-composition/models/PromptPackage";
import type { IAIProvider } from "../contracts/IAIProvider";
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
import {
  createAIProviderService,
  type AIProviderService,
} from "../services/AIProviderService";

function resolveService(service?: AIProviderService): AIProviderService {
  return service ?? createAIProviderService();
}

/**
 * Public API — PromptPackage → immutable AIRequest.
 */
export function createAIRequest(options: {
  readonly promptPackage: PromptPackage;
  readonly providerId?: AIProviderId | null;
  readonly model?: AIModel | null;
  readonly options?: AIExecutionOptions;
  readonly metadata?: AIProviderMetadata;
  readonly requestId?: string;
  readonly createdAt?: string;
  readonly service?: AIProviderService;
}): AIRequest {
  const { service, ...rest } = options;
  return resolveService(service).createAIRequest(rest);
}

/**
 * Public API — prepare immutable AIRequest from PromptPackage.
 * @deprecated Prefer {@link createAIRequest}; kept for Sprint 19.2 compatibility.
 */
export function prepareAIRequest(options: {
  readonly promptPackage: PromptPackage;
  readonly providerId?: AIProviderId | null;
  readonly model?: AIModel | null;
  readonly options?: AIExecutionOptions;
  readonly metadata?: AIProviderMetadata;
  readonly requestId?: string;
  readonly createdAt?: string;
  readonly service?: AIProviderService;
}): AIRequest {
  return createAIRequest(options);
}

/**
 * Public API — soft-validate a registered provider.
 */
export function validateProvider(
  providerId: AIProviderId,
  service?: AIProviderService,
): readonly string[] {
  return resolveService(service).validateProvider(providerId);
}

/**
 * Public API — resolve a registered provider contract.
 */
export function resolveProvider(
  providerId: AIProviderId,
  service?: AIProviderService,
): IAIProvider {
  return resolveService(service).resolveProvider(providerId);
}

/**
 * Public API — list registered provider contracts.
 */
export function listProviders(
  service?: AIProviderService,
): readonly IAIProvider[] {
  return resolveService(service).listProviders();
}

/**
 * Public API — describe a registered provider as an immutable snapshot.
 */
export function describeProvider(
  providerId: AIProviderId,
  service?: AIProviderService,
): AIProviderSnapshot | null {
  return resolveService(service).describeProvider(providerId);
}

/**
 * Public API — create immutable execution context (no execution).
 */
export function createExecutionContext(options: {
  readonly request: AIRequest;
  readonly providerId?: AIProviderId | null;
  readonly contextId?: string;
  readonly preparedAt?: string;
  readonly service?: AIProviderService;
}): AIExecutionContext {
  const { service, ...rest } = options;
  return resolveService(service).createExecutionContext(rest);
}

/**
 * Public API — wrap AIResponse into AIProviderResult (no networking).
 */
export function toProviderResult(options: {
  readonly request: AIRequest;
  readonly response: AIResponse;
  readonly provider?: AIProvider | null;
  readonly context?: AIExecutionContext | null;
  readonly preparedAt?: string;
  readonly service?: AIProviderService;
}): AIProviderResult {
  const { service, ...rest } = options;
  return resolveService(service).fromResponse(rest);
}
