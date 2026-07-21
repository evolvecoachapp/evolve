import type { AIConfiguration } from "../../ai-config/models/AIConfiguration";
import { HttpClient } from "../../http/client/HttpClient";
import { AIError } from "../models/AIError";
import type { AIProviderType } from "../models/AIProviderType";
import { AI_PROVIDER_TYPES } from "../models/AIProviderType";
import type { AIProvider } from "./AIProvider";
import { AnthropicProviderStub } from "./AnthropicProviderStub";
import { GeminiProviderStub } from "./GeminiProviderStub";
import { LocalProviderStub } from "./LocalProviderStub";
import { OpenAIProvider } from "./openai/OpenAIProvider";
import { OpenAIProviderStub } from "./OpenAIProviderStub";

function isAIProviderType(value: string): value is AIProviderType {
  return (AI_PROVIDER_TYPES as readonly string[]).includes(value);
}

/**
 * Resolves an AIProvider by type.
 *
 * `create` returns offline stubs (backward compatible for tests).
 * `createConfigured` builds the real OpenAI provider when configured;
 * other providers remain stubs until implemented.
 */
export class AIProviderFactory {
  /** Offline stubs — no networking. */
  static create(type: AIProviderType): AIProvider {
    switch (type) {
      case "openai":
        return new OpenAIProviderStub();
      case "anthropic":
        return new AnthropicProviderStub();
      case "gemini":
        return new GeminiProviderStub();
      case "local":
        return new LocalProviderStub();
      default: {
        const exhaustive: never = type;
        throw new AIError(
          "unsupported_provider",
          `Unsupported AI provider type: ${String(exhaustive)}`,
        );
      }
    }
  }

  /** Runtime-safe entry for untrusted config strings. */
  static createFromString(type: string): AIProvider {
    if (!isAIProviderType(type)) {
      throw new AIError(
        "unsupported_provider",
        `Unsupported AI provider type: ${type}`,
      );
    }
    return AIProviderFactory.create(type);
  }

  /**
   * Build a provider from injected configuration + optional HttpClient.
   *
   * OpenAI → real REST provider. Other types → stubs until wired.
   * No singleton — each call returns a new instance.
   */
  static createConfigured(
    configuration: AIConfiguration,
    httpClient: HttpClient = new HttpClient({
      defaultTimeoutMs: configuration.timeout.timeoutMs,
      defaultMaxRetries: configuration.retry.maxRetries,
    }),
  ): AIProvider {
    switch (configuration.provider.type) {
      case "openai":
        return new OpenAIProvider(httpClient, configuration);
      case "anthropic":
        return new AnthropicProviderStub();
      case "gemini":
        return new GeminiProviderStub();
      case "local":
        return new LocalProviderStub();
      default: {
        const exhaustive: never = configuration.provider.type;
        throw new AIError(
          "unsupported_provider",
          `Unsupported AI provider type: ${String(exhaustive)}`,
        );
      }
    }
  }
}
