import type { AIFinishReason } from "../models/AIFinishReason";
import { AIFinishReasons } from "../models/AIFinishReason";
import type { AIProviderId } from "../models/AIProviderId";
import type { AIProviderMetadata } from "../models/AIProviderMetadata";
import { EMPTY_PROVIDER_METADATA } from "../models/AIProviderMetadata";
import type { AIResponse } from "../models/AIResponse";
import type { AITokenUsage } from "../models/AITokenUsage";
import { ZERO_TOKEN_USAGE } from "../models/AITokenUsage";
import { freezeResponse } from "../utils/freezeObjects";

/**
 * Fluent builder for immutable standardized AIResponse.
 *
 * Used by tests and future provider mappers — no networking here.
 */
export class AIResponseBuilder {
  private id = "";
  private requestId = "";
  private providerId: AIProviderId = "";
  private modelId: string | null = null;
  private content = "";
  private finishReason: AIFinishReason = AIFinishReasons.UNKNOWN;
  private usage: AITokenUsage = ZERO_TOKEN_USAGE;
  private metadata: AIProviderMetadata = EMPTY_PROVIDER_METADATA;
  private createdAt = "";

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withRequestId(requestId: string): this {
    this.requestId = requestId;
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

  withContent(content: string): this {
    this.content = content;
    return this;
  }

  withFinishReason(finishReason: AIFinishReason): this {
    this.finishReason = finishReason;
    return this;
  }

  withUsage(usage: AITokenUsage): this {
    this.usage = usage;
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

  build(): AIResponse {
    if (!this.id || !this.requestId || !this.providerId || !this.createdAt) {
      throw new Error("AIResponseBuilder missing required fields");
    }

    return freezeResponse({
      id: this.id,
      requestId: this.requestId,
      providerId: this.providerId,
      modelId: this.modelId,
      content: this.content,
      finishReason: this.finishReason,
      usage: this.usage,
      metadata: this.metadata,
      createdAt: this.createdAt,
    });
  }
}
