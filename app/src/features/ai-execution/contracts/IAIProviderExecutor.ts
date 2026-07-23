import type { AIExecutionOptions } from "../../ai-provider/models/AIExecutionOptions";
import type { AIProviderId } from "../../ai-provider/models/AIProviderId";
import type { AIResponse } from "../../ai-provider/models/AIResponse";
import type { PromptPackage } from "../../prompt-composition/models/PromptPackage";

/**
 * Provider-agnostic execution adapter.
 *
 * Concrete providers (e.g. OpenAI) are wrapped externally without modifying
 * their modules. The pipeline never contains provider-specific code.
 */
export interface AIProviderExecuteInput {
  readonly promptPackage: PromptPackage;
  readonly modelId?: string | null;
  readonly options?: AIExecutionOptions | null;
  readonly requestId?: string;
  readonly executedAt?: string;
}

export interface IAIProviderExecutor {
  readonly providerId: AIProviderId;
  execute(input: AIProviderExecuteInput): Promise<AIResponse>;
}

/**
 * Resolves an executor for a provider id.
 */
export interface IAIProviderExecutorResolver {
  resolve(providerId: AIProviderId): IAIProviderExecutor | null;
}
