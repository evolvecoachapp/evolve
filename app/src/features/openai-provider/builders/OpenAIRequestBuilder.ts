import type { OpenAIMessage } from "../models/OpenAIMessage";
import type { OpenAIRequest } from "../models/OpenAIRequest";
import { freezeRequest } from "../utils/freezeObjects";

/**
 * Fluent builder for immutable OpenAIRequest.
 */
export class OpenAIRequestBuilder {
  private model = "";
  private messages: OpenAIMessage[] = [];
  private temperature: number | null = null;
  private maxTokens: number | null = null;
  private topP: number | null = null;
  private stop: readonly string[] | null = null;
  private timeoutMs: number | null = null;

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
      stream: false,
      timeoutMs: this.timeoutMs,
    });
  }
}
