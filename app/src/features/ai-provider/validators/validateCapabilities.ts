import type { AIProviderCapabilities } from "../models/AIProviderCapabilities";
import { ALL_CAPABILITY_KEYS } from "../models/AIProviderCapabilities";

/**
 * Soft-validate capability object shape / boolean flags.
 */
export function validateCapabilities(
  capabilities: AIProviderCapabilities | null | undefined,
): readonly string[] {
  const issues: string[] = [];

  if (!capabilities) {
    issues.push("capabilities_missing");
    return issues;
  }

  for (const key of ALL_CAPABILITY_KEYS) {
    if (typeof capabilities[key] !== "boolean") {
      issues.push(`capability_invalid:${key}`);
    }
  }

  if (!capabilities.chat) {
    issues.push("capability_chat_disabled");
  }

  return issues;
}
