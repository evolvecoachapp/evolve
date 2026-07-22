import type { AIProvider } from "../models/AIProvider";
import type { AIProviderCapabilities } from "../models/AIProviderCapabilities";
import type { AIProviderCapabilityKey } from "../models/AIProviderCapabilities";
import type { AIProviderConfiguration } from "../models/AIProviderConfiguration";
import type { AIProviderId } from "../models/AIProviderId";
import type { AIProviderMetadata } from "../models/AIProviderMetadata";
import type { AIProviderStatus } from "../models/AIProviderStatus";

/**
 * Core AI provider contract.
 *
 * Future OpenAI / Anthropic / Gemini / Ollama adapters implement this.
 * This sprint ships the interface only — no HTTP, SDKs, or networking.
 */
export interface IAIProvider {
  readonly id: AIProviderId;

  getInfo(): AIProvider;
  getCapabilities(): AIProviderCapabilities;
  getConfiguration(): AIProviderConfiguration;
  getMetadata(): AIProviderMetadata;
  getStatus(): AIProviderStatus;
  supports(capability: AIProviderCapabilityKey): boolean;
}
