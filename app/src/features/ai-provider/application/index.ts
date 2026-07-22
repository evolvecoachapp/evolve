import type { PromptPackage } from "../../prompt-composition/models/PromptPackage";
import type { IAIProvider } from "../contracts/IAIProvider";
import type { AIExecutionContext } from "../models/AIExecutionContext";
import type { AIExecutionOptions } from "../models/AIExecutionOptions";
import type { AIModel } from "../models/AIModel";
import type { AIProviderId } from "../models/AIProviderId";
import type { AIProviderMetadata } from "../models/AIProviderMetadata";
import type { AIRequest } from "../models/AIRequest";
import {
  createAIProviderService,
  type AIProviderService,
} from "../services/AIProviderService";

function resolveService(service?: AIProviderService): AIProviderService {
  return service ?? createAIProviderService();
}

/**
 * Public API — prepare immutable AIRequest from PromptPackage.
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
  const { service, ...rest } = options;
  return resolveService(service).prepareAIRequest(rest);
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
