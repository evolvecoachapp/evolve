import type { PromptPackage } from "../../prompt-composition/models/PromptPackage";
import type { AIExecutionOptions } from "../../ai-provider/models/AIExecutionOptions";
import type { AIProviderId } from "../../ai-provider/models/AIProviderId";
import type { AIExecutionCancellation } from "./AIExecutionCancellation";
import type { AIExecutionMetadata } from "./AIExecutionMetadata";
import type { AIExecutionPolicy } from "./AIExecutionPolicy";
import type { AIExecutionTimeout } from "./AIExecutionTimeout";

/**
 * Immutable pipeline execution request.
 *
 * Carries PromptPackage + provider selection. No provider-specific payload.
 */
export interface AIExecutionRequest {
  readonly id: string;
  readonly promptPackage: PromptPackage;
  readonly providerId: AIProviderId;
  readonly modelId: string | null;
  readonly options: AIExecutionOptions;
  readonly metadata: AIExecutionMetadata;
  readonly policy: AIExecutionPolicy;
  readonly cancellation: AIExecutionCancellation;
  readonly timeout: AIExecutionTimeout;
  readonly createdAt: string;
}
