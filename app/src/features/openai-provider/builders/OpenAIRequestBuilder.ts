import type { AIExecutionOptions } from "../../ai-provider/models/AIExecutionOptions";
import type { PromptPackage } from "../../prompt-composition/models/PromptPackage";
import type { OpenAIMessage } from "../models/OpenAIMessage";
import type { OpenAIRequest } from "../models/OpenAIRequest";
import type { OpenAIProviderConfiguration } from "../models/OpenAIProviderConfiguration";
import { freezeRequest } from "../utils/freezeObjects";

/**
 * Fluent builder for immutable OpenAIRequest.
 *
 * Transforms PromptPackage → OpenAI Request via {@link fromPromptPackage}.
 */
export class OpenAIRequestBuilder {
  private model = "";
  private messages: OpenAIMessage[] = [];
  private temperature: number | null = null;
  private maxTokens: number | null = null;
  private topP: number | null = null;
  private stop: readonly string[] | null = null;
  private timeoutMs: number | null = null;
  private stream = false;

  /**
   * Transform PromptPackage → OpenAIRequest (PromptPackage → OpenAI Request).
   *
   * Lazy-loads PromptPackageMapper to avoid circular module init.
   */
  static fromPromptPackage(
    promptPackage: PromptPackage,
    options: {
      readonly modelId?: string | null;
      readonly options?: AIExecutionOptions | null;
      readonly configuration: OpenAIProviderConfiguration;
      readonly stream?: boolean;
    },
  ): OpenAIRequest {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PromptPackageMapper } =
      require("../mappers/PromptPackageMapper") as typeof import("../mappers/PromptPackageMapper");

    const mapped = PromptPackageMapper.map(promptPackage, {
      modelId: options.modelId,
      options: options.options,
      configuration: options.configuration,
    });

    return new OpenAIRequestBuilder()
      .withModel(mapped.model)
      .withMessages(mapped.messages)
      .withTemperature(mapped.temperature)
      .withMaxTokens(mapped.maxTokens)
      .withTopP(mapped.topP)
      .withStop(mapped.stop)
      .withTimeoutMs(mapped.timeoutMs)
      .withStream(options.stream ?? mapped.stream)
      .build();
  }

  withModel(model: string): this {
    this.model = model;
    return this;
  }

  withMessages(messages: readonly OpenAIMessage[]): this {
    this.messages = [...messages];
    return this;
  }

  addMessage(message: OpenAIMessage): this {
    this.messages.push(message);
    return this;
  }

  withTemperature(temperature: number | null): this {
    this.temperature = temperature;
    return this;
  }

  withMaxTokens(maxTokens: number | null): this {
    this.maxTokens = maxTokens;
    return this;
  }

  withTopP(topP: number | null): this {
    this.topP = topP;
    return this;
  }

  withStop(stop: readonly string[] | null): this {
    this.stop = stop;
    return this;
  }

  withTimeoutMs(timeoutMs: number | null): this {
    this.timeoutMs = timeoutMs;
    return this;
  }

  withStream(stream: boolean): this {
    this.stream = stream;
    return this;
  }

  build(): OpenAIRequest {
    if (!this.model || this.messages.length === 0) {
      throw new Error("OpenAIRequestBuilder missing required fields");
    }

    return freezeRequest({
      model: this.model,
      messages: this.messages,
      temperature: this.temperature,
      maxTokens: this.maxTokens,
      topP: this.topP,
      stop: this.stop,
      stream: this.stream,
      timeoutMs: this.timeoutMs,
    });
  }
}
