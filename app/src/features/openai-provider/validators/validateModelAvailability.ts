import type { OpenAIProviderConfiguration } from "../models/OpenAIProviderConfiguration";
import { modelNamesEqual, normalizeModelName } from "../utils/normalizeModelName";

/**
 * Validate that a model id is available in provider configuration.
 */
export function validateModelAvailability(
  modelId: string | null | undefined,
  configuration: OpenAIProviderConfiguration,
): readonly string[] {
  const issues: string[] = [];
  const normalized = normalizeModelName(modelId);

  if (!normalized) {
    issues.push("openai_model_missing");
    return issues;
  }

  const match = configuration.models.find((model) =>
    modelNamesEqual(model.modelId, normalized),
  );

  if (!match) {
    issues.push("openai_model_unknown");
    return issues;
  }

  if (!match.available) {
    issues.push("openai_model_unavailable");
  }

  return issues;
}
