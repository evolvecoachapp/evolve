import type { IAIProvider } from "../contracts/IAIProvider";
import { validateCapabilities } from "./validateCapabilities";
import { validateConfiguration } from "./validateConfiguration";
import { validateModels } from "./validateModels";
import { validateProviderId } from "./validateProviderId";

/**
 * Soft-validate provider registration readiness.
 */
export function validateProviderRegistration(
  provider: IAIProvider | null | undefined,
): readonly string[] {
  const issues: string[] = [];
  if (!provider) {
    issues.push("provider_missing");
    return Object.freeze(issues);
  }

  issues.push(...validateProviderId(provider.id));
  issues.push(...validateCapabilities(provider.getCapabilities()));
  issues.push(...validateConfiguration(provider.getConfiguration()));
  issues.push(...validateModels(provider.getInfo().models));

  if (provider.getInfo().id !== provider.id) {
    issues.push("provider_info_id_mismatch");
  }

  return Object.freeze(issues);
}
