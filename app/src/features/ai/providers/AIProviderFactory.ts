import { AIError } from "../models/AIError";
import type { AIProviderType } from "../models/AIProviderType";
import { AI_PROVIDER_TYPES } from "../models/AIProviderType";
import type { AIProvider } from "./AIProvider";
import { AnthropicProviderStub } from "./AnthropicProviderStub";
import { GeminiProviderStub } from "./GeminiProviderStub";
import { LocalProviderStub } from "./LocalProviderStub";
import { OpenAIProviderStub } from "./OpenAIProviderStub";

function isAIProviderType(value: string): value is AIProviderType {
  return (AI_PROVIDER_TYPES as readonly string[]).includes(value);
}

/**
 * Resolves an AIProvider stub by type.
 *
 * Returns stub implementations only — no networking, no SDKs.
 */
export class AIProviderFactory {
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
}
