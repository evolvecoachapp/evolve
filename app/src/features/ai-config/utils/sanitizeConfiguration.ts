import type { AIConfiguration } from "../models/AIConfiguration";
import { maskSecrets } from "./maskSecrets";

/**
 * Produce a safe configuration view for logging or diagnostics.
 *
 * Masks secrets; does not perform networking or provider logic.
 */
export function sanitizeConfiguration(
  configuration: AIConfiguration,
): AIConfiguration {
  return maskSecrets(configuration);
}
