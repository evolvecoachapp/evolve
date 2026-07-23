import type { AIProviderCapabilities } from "../models/AIProviderCapabilities";
import { ALL_CAPABILITY_KEYS } from "../models/AIProviderCapabilities";
import type { AIProviderFeatures } from "../models/AIProviderFeatures";
import type { AIProviderStatistics } from "../models/AIProviderStatistics";
import { EMPTY_PROVIDER_STATISTICS } from "../models/AIProviderStatistics";
import { listEnabledCapabilities } from "./aggregateCapabilities";

/**
 * Derive feature flags from capability flags.
 */
export function toProviderFeatures(
  capabilities: AIProviderCapabilities,
): AIProviderFeatures {
  return Object.freeze({
    supportsChat: capabilities.chat,
    supportsStreaming: capabilities.streaming,
    supportsTools: capabilities.tools,
    supportsVision: capabilities.vision,
    supportsAudio: capabilities.audio,
    supportsEmbeddings: capabilities.embeddings,
    supportsReasoning: false,
    supportsFunctionCalling: capabilities.tools,
  });
}

/**
 * Build baseline statistics from descriptor metadata.
 */
export function buildProviderStatistics(options: {
  readonly modelCount: number;
  readonly capabilities: AIProviderCapabilities;
  readonly lastUsedAt?: string | null;
}): AIProviderStatistics {
  return Object.freeze({
    ...EMPTY_PROVIDER_STATISTICS,
    registeredModelCount: options.modelCount,
    enabledCapabilityCount: listEnabledCapabilities(options.capabilities)
      .length,
    lastUsedAt: options.lastUsedAt ?? null,
  });
}

/**
 * Count how many of the known capability keys are enabled.
 */
export function countEnabledCapabilities(
  capabilities: AIProviderCapabilities,
): number {
  return ALL_CAPABILITY_KEYS.filter((key) => capabilities[key]).length;
}
