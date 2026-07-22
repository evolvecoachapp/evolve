import type { PromptPackage } from "../../prompt-composition/models/PromptPackage";
import type { AIExecutionOptions } from "./AIExecutionOptions";
import type { AIModel } from "./AIModel";
import type { AIProviderId } from "./AIProviderId";
import type { AIProviderMetadata } from "./AIProviderMetadata";

/**
 * Immutable AI request prepared from a PromptPackage.
 *
 * Carries structured prompt composition output for future providers.
 * Does not contain provider-specific prompt strings or perform HTTP.
 */
export interface AIRequest {
  readonly id: string;
  readonly promptPackageId: string;
  readonly promptPackage: PromptPackage;
  readonly providerId: AIProviderId | null;
  readonly model: AIModel | null;
  readonly options: AIExecutionOptions;
  readonly metadata: AIProviderMetadata;
  readonly createdAt: string;
}
