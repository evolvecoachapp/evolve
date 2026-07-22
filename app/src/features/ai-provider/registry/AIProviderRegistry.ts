import type { IAIProvider } from "../contracts/IAIProvider";
import type { IAIProviderRegistry } from "../contracts/IAIProviderRegistry";
import { AIProviderError } from "../models/AIProviderError";
import type { AIProviderId } from "../models/AIProviderId";
import { AIProviderStatuses } from "../models/AIProviderStatus";
import { normalizeProviderId } from "../utils/normalizeProviderId";
import {
  validateCapabilities,
  validateConfiguration,
  validateProviderId,
} from "../validators";

/**
 * In-memory Provider Registry.
 *
 * Register / resolve / list / availability validation only.
 * No concrete OpenAI / Anthropic / Gemini / Ollama providers.
 */
export class AIProviderRegistry implements IAIProviderRegistry {
  private readonly providers = new Map<AIProviderId, IAIProvider>();

  register(provider: IAIProvider): void {
    const idIssues = validateProviderId(provider.id);
    if (idIssues.length > 0) {
      throw new AIProviderError(
        "invalid_provider_id",
        `Cannot register provider: ${idIssues.join(", ")}`,
        provider.id,
      );
    }

    const normalizedId = normalizeProviderId(provider.id);
    if (this.providers.has(normalizedId)) {
      throw new AIProviderError(
        "provider_already_registered",
        `Provider already registered: ${normalizedId}`,
        normalizedId,
      );
    }

    const configIssues = validateConfiguration(provider.getConfiguration());
    const hardConfigIssues = configIssues.filter(
      (issue) =>
        issue === "configuration_missing" ||
        issue.startsWith("provider_id_") ||
        issue === "configuration_display_name_missing",
    );
    if (hardConfigIssues.length > 0) {
      throw new AIProviderError(
        "invalid_provider_configuration",
        `Cannot register provider: ${hardConfigIssues.join(", ")}`,
        normalizedId,
      );
    }

    const capabilityIssues = validateCapabilities(provider.getCapabilities());
    const hardCapabilityIssues = capabilityIssues.filter(
      (issue) => issue === "capabilities_missing",
    );
    if (hardCapabilityIssues.length > 0) {
      throw new AIProviderError(
        "invalid_provider_capabilities",
        `Cannot register provider: ${hardCapabilityIssues.join(", ")}`,
        normalizedId,
      );
    }

    this.providers.set(normalizedId, provider);
  }

  unregister(providerId: AIProviderId): boolean {
    return this.providers.delete(normalizeProviderId(providerId));
  }

  resolve(providerId: AIProviderId): IAIProvider | null {
    return this.providers.get(normalizeProviderId(providerId)) ?? null;
  }

  list(): readonly IAIProvider[] {
    return Object.freeze([...this.providers.values()]);
  }

  has(providerId: AIProviderId): boolean {
    return this.providers.has(normalizeProviderId(providerId));
  }

  isAvailable(providerId: AIProviderId): boolean {
    return this.validateAvailability(providerId).length === 0;
  }

  validateAvailability(providerId: AIProviderId): readonly string[] {
    const issues: string[] = [];
    const normalizedId = normalizeProviderId(providerId);

    issues.push(...validateProviderId(normalizedId));
    if (issues.length > 0) {
      return issues;
    }

    const provider = this.providers.get(normalizedId);
    if (!provider) {
      issues.push(`provider_not_registered:${normalizedId}`);
      return issues;
    }

    const status = provider.getStatus();
    if (status === AIProviderStatuses.DISABLED) {
      issues.push(`provider_disabled:${normalizedId}`);
    } else if (status === AIProviderStatuses.UNAVAILABLE) {
      issues.push(`provider_unavailable:${normalizedId}`);
    } else if (status === AIProviderStatuses.UNREGISTERED) {
      issues.push(`provider_unregistered_status:${normalizedId}`);
    }

    const configuration = provider.getConfiguration();
    if (!configuration.enabled) {
      issues.push(`provider_configuration_disabled:${normalizedId}`);
    }

    if (!provider.supports("chat")) {
      issues.push(`provider_chat_unsupported:${normalizedId}`);
    }

    return issues;
  }

  clear(): void {
    this.providers.clear();
  }
}

export function createAIProviderRegistry(): AIProviderRegistry {
  return new AIProviderRegistry();
}
