import type { AIProviderLimits } from "../models/AIProviderLimits";

/**
 * Soft-validate provider limits placeholders.
 */
export function validateLimits(
  limits: AIProviderLimits | null | undefined,
): readonly string[] {
  const issues: string[] = [];
  if (!limits) {
    issues.push("limits_missing");
    return Object.freeze(issues);
  }

  const numericKeys: (keyof AIProviderLimits)[] = [
    "maxInputTokens",
    "maxOutputTokens",
    "maxRequestsPerMinute",
    "maxConcurrentRequests",
    "maxContextWindow",
  ];

  for (const key of numericKeys) {
    const value = limits[key];
    if (value != null && (typeof value !== "number" || value < 0)) {
      issues.push(`limits_${key}_invalid`);
    }
  }

  if (
    limits.maxInputTokens != null &&
    limits.maxContextWindow != null &&
    limits.maxInputTokens > limits.maxContextWindow
  ) {
    issues.push("limits_input_exceeds_context_window");
  }

  return Object.freeze(issues);
}
