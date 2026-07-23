import type { PromptPackage } from "../../prompt-composition/models/PromptPackage";
import type { AIExecutionOptions } from "../../ai-provider/models/AIExecutionOptions";
import { DEFAULT_EXECUTION_OPTIONS } from "../../ai-provider/models/AIExecutionOptions";
import type { AIProviderId } from "../../ai-provider/models/AIProviderId";
import type { AIExecutionCancellation } from "../models/AIExecutionCancellation";
import { NO_CANCELLATION } from "../models/AIExecutionCancellation";
import type { AIExecutionMetadata } from "../models/AIExecutionMetadata";
import { EMPTY_EXECUTION_METADATA } from "../models/AIExecutionMetadata";
import type { AIExecutionPolicy } from "../models/AIExecutionPolicy";
import { DEFAULT_AI_EXECUTION_POLICY } from "../models/AIExecutionPolicy";
import type { AIExecutionRequest } from "../models/AIExecutionRequest";
import type { AIExecutionTimeout } from "../models/AIExecutionTimeout";
import { NO_TIMEOUT } from "../models/AIExecutionTimeout";
import { freezeRequest } from "../utils/freezeObjects";

/**
 * Fluent builder for immutable AIExecutionRequest.
 */
export class AIExecutionRequestBuilder {
  private id = "";
  private promptPackage: PromptPackage | null = null;
  private providerId: AIProviderId | null = null;
  private modelId: string | null = null;
  private options: AIExecutionOptions = DEFAULT_EXECUTION_OPTIONS;
  private metadata: AIExecutionMetadata = EMPTY_EXECUTION_METADATA;
  private policy: AIExecutionPolicy = DEFAULT_AI_EXECUTION_POLICY;
  private cancellation: AIExecutionCancellation = NO_CANCELLATION;
  private timeout: AIExecutionTimeout = NO_TIMEOUT;
  private createdAt = "";

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withPromptPackage(promptPackage: PromptPackage): this {
    this.promptPackage = promptPackage;
    return this;
  }

  withProviderId(providerId: AIProviderId): this {
    this.providerId = providerId;
    return this;
  }

  withModelId(modelId: string | null): this {
    this.modelId = modelId;
    return this;
  }

  withOptions(options: AIExecutionOptions): this {
    this.options = options;
    return this;
  }

  withMetadata(metadata: AIExecutionMetadata): this {
    this.metadata = metadata;
    return this;
  }

  withPolicy(policy: AIExecutionPolicy): this {
    this.policy = policy;
    return this;
  }

  withCancellation(cancellation: AIExecutionCancellation): this {
    this.cancellation = cancellation;
    return this;
  }

  withTimeout(timeout: AIExecutionTimeout): this {
    this.timeout = timeout;
    return this;
  }

  withCreatedAt(createdAt: string): this {
    this.createdAt = createdAt;
    return this;
  }

  build(): AIExecutionRequest {
    if (!this.id || !this.promptPackage || !this.providerId || !this.createdAt) {
      throw new Error("AIExecutionRequestBuilder missing required fields");
    }

    return freezeRequest({
      id: this.id,
      promptPackage: this.promptPackage,
      providerId: this.providerId,
      modelId: this.modelId,
      options: this.options,
      metadata: this.metadata,
      policy: this.policy,
      cancellation: this.cancellation,
      timeout: this.timeout,
      createdAt: this.createdAt,
    });
  }
}
