import type { OpenAIChoice } from "../models/OpenAIChoice";
import type { OpenAIResponse } from "../models/OpenAIResponse";
import type { OpenAIUsage } from "../models/OpenAIUsage";
import { ZERO_OPENAI_USAGE } from "../models/OpenAIUsage";
import { freezeResponseOpenAI } from "../utils/freezeObjects";

/**
 * Fluent builder for immutable OpenAIResponse.
 */
export class OpenAIResponseBuilder {
  private id = "";
  private model = "";
  private choices: OpenAIChoice[] = [];
  private usage: OpenAIUsage = ZERO_OPENAI_USAGE;
  private createdAt = "";
  private rawFinishReason: string | null = null;

  withId(id: string): this {
    this.id = id;
    return this;
  }

  withModel(model: string): this {
    this.model = model;
    return this;
  }

  withChoices(choices: readonly OpenAIChoice[]): this {
    this.choices = [...choices];
    return this;
  }

  withUsage(usage: OpenAIUsage): this {
    this.usage = usage;
    return this;
  }

  withCreatedAt(createdAt: string): this {
    this.createdAt = createdAt;
    return this;
  }

  withRawFinishReason(rawFinishReason: string | null): this {
    this.rawFinishReason = rawFinishReason;
    return this;
  }

  build(): OpenAIResponse {
    if (!this.id || !this.model || !this.createdAt) {
      throw new Error("OpenAIResponseBuilder missing required fields");
    }

    return freezeResponseOpenAI({
      id: this.id,
      model: this.model,
      choices: this.choices,
      usage: this.usage,
      createdAt: this.createdAt,
      rawFinishReason: this.rawFinishReason,
    });
  }
}
