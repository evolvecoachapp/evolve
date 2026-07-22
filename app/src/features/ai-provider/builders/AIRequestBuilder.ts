import type { PromptPackage } from "../../prompt-composition/models/PromptPackage";
import type { AIExecutionOptions } from "../models/AIExecutionOptions";
import { DEFAULT_EXECUTION_OPTIONS } from "../models/AIExecutionOptions";
import type { AIModel } from "../models/AIModel";
import type { AIProviderId } from "../models/AIProviderId";
import type { AIProviderMetadata } from "../models/AIProviderMetadata";
import { EMPTY_PROVIDER_METADATA } from "../models/AIProviderMetadata";
import type { AIRequest } from "../models/AIRequest";
import { freezeRequest } from "../utils/freezeObjects";

/**
 * Fluent builder for immutable AIRequest.
 */
export class AIRequestBuilder {
  private id = "";
  private promptPackage: PromptPackage | null = null;
  private providerId: AIProviderId | null = null;
  private model: AIModel | null = null;
  private options: AIExecutionOptions = DEFAULT_EXECUTION_OPTIONS;
  private metadata: AIProviderMetadata = EMPTY_PROVIDER_METADATA;
  private createdAt = "";

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withPromptPackage(promptPackage: PromptPackage): this {
    this.promptPackage = promptPackage;
    return this;
  }

  withProviderId(providerId: AIProviderId | null): this {
    this.providerId = providerId;
    return this;
  }

  withModel(model: AIModel | null): this {
    this.model = model;
    return this;
  }

  withOptions(options: AIExecutionOptions): this {
    this.options = options;
    return this;
  }

  withMetadata(metadata: AIProviderMetadata): this {
    this.metadata = metadata;
    return this;
  }

  withCreatedAt(createdAt: string): this {
    this.createdAt = createdAt;
    return this;
  }

  build(): AIRequest {
    if (!this.id || !this.promptPackage || !this.createdAt) {
      throw new Error("AIRequestBuilder missing required fields");
    }

    return freezeRequest({
      id: this.id,
      promptPackageId: this.promptPackage.id,
      promptPackage: this.promptPackage,
      providerId: this.providerId,
      model: this.model,
      options: this.options,
      metadata: this.metadata,
      createdAt: this.createdAt,
    });
  }
}
