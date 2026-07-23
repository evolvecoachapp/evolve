import type { IAIProviderRegistry } from "../../ai-provider/contracts/IAIProviderRegistry";
import type { AIProviderId } from "../../ai-provider/models/AIProviderId";
import type { IAIProviderExecutorResolver } from "../contracts/IAIProviderExecutor";

/**
 * Validate provider registration / availability and executor resolution.
 */
export function validateProviderAvailability(options: {
  readonly providerId: AIProviderId | null | undefined;
  readonly registry: IAIProviderRegistry;
  readonly executorResolver?: IAIProviderExecutorResolver | null;
}): readonly string[] {
  const issues: string[] = [];
  const providerId = options.providerId;

  if (!providerId?.trim()) {
    return Object.freeze(["provider_id_missing"]);
  }

  issues.push(...options.registry.validateAvailability(providerId));

  if (options.executorResolver) {
    const executor = options.executorResolver.resolve(providerId);
    if (!executor) {
      issues.push(`provider_executor_not_found:${providerId}`);
    } else if (executor.providerId !== providerId) {
      issues.push(`provider_executor_id_mismatch:${providerId}`);
    }
  }

  return Object.freeze([...new Set(issues)]);
}
