import type { AIModel } from "../models/AIModel";
import type { AIModelInfo } from "../models/AIModelInfo";
import type { AIProvider } from "../models/AIProvider";
import type { AIProviderConfiguration } from "../models/AIProviderConfiguration";
import { normalizeProviderId } from "../utils/normalizeProviderId";

/**
 * Soft-validate model selection against optional provider catalog.
 */
export function validateModelSelection(options: {
  readonly model: AIModel | null | undefined;
  readonly provider?: AIProvider | null;
  readonly configuration?: AIProviderConfiguration | null;
  readonly availableModels?: readonly AIModelInfo[];
}): readonly string[] {
  const issues: string[] = [];
  const { model, provider, configuration, availableModels } = options;

  if (!model) {
    if (!configuration?.defaultModelId) {
      issues.push("model_selection_missing");
    }
    return issues;
  }

  if (!model.id || model.id.trim().length === 0) {
    issues.push("model_id_missing");
  }

  if (
    model.providerId &&
    provider &&
    normalizeProviderId(model.providerId) !==
      normalizeProviderId(provider.id)
  ) {
    issues.push(
      `model_provider_mismatch:${model.providerId}!=${provider.id}`,
    );
  }

  const catalog = availableModels ?? provider?.models ?? [];
  if (catalog.length > 0 && model.id) {
    const match = catalog.find((entry) => entry.id === model.id);
    if (!match) {
      issues.push(`model_not_in_catalog:${model.id}`);
    } else if (!match.available) {
      issues.push(`model_unavailable:${model.id}`);
    }
  }

  return issues;
}
