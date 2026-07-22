import type { PromptPackage } from "../../prompt-composition/models/PromptPackage";
import type { IAIProvider } from "../contracts/IAIProvider";
import type { IAIProviderRegistry } from "../contracts/IAIProviderRegistry";
import {
  createAIProviderEngine,
  AIProviderEngine,
  type PrepareAIRequestInput,
} from "../engine/AIProviderEngine";
import type { AIExecutionContext } from "../models/AIExecutionContext";
import type { AIExecutionOptions } from "../models/AIExecutionOptions";
import type { AIModel } from "../models/AIModel";
import type { AIProviderId } from "../models/AIProviderId";
import type { AIProviderMetadata } from "../models/AIProviderMetadata";
import type { AIProviderResult } from "../models/AIProviderResult";
import type { AIRequest } from "../models/AIRequest";

/**
 * Service facade over AIProviderEngine.
 * Hides engine internals from application consumers.
 */
export class AIProviderService {
  constructor(
    private readonly engine: AIProviderEngine = createAIProviderEngine(),
  ) {}

  getRegistry(): IAIProviderRegistry {
    return this.engine.getRegistry();
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

  resolveProvider(providerId: AIProviderId): IAIProvider {
    return this.engine.resolveProvider(providerId);
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
}

export function createAIProviderService(
  engine?: AIProviderEngine,
): AIProviderService {
  return new AIProviderService(engine);
}
