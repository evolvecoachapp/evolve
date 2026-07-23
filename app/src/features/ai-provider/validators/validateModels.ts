import type { AIModelInfo } from "../models/AIModelInfo";
import { validateCapabilities } from "./validateCapabilities";
import { validateLimits } from "./validateLimits";

/**
 * Soft-validate model catalog entries.
 */
export function validateModels(
  models: readonly AIModelInfo[] | null | undefined,
): readonly string[] {
  const issues: string[] = [];
  if (!models) {
    issues.push("models_missing");
    return Object.freeze(issues);
  }

  const seen = new Set<string>();
  for (const model of models) {
    if (!model.id?.trim()) {
      issues.push("model_id_missing");
      continue;
    }
    if (seen.has(model.id)) {
      issues.push(`model_id_duplicate:${model.id}`);
    }
    seen.add(model.id);

    if (!model.displayName?.trim()) {
      issues.push(`model_display_name_missing:${model.id}`);
    }

    issues.push(
      ...validateCapabilities(model.capabilities).map(
        (issue) => `model_${model.id}_${issue}`,
      ),
    );
    issues.push(
      ...validateLimits(model.limits).map(
        (issue) => `model_${model.id}_${issue}`,
      ),
    );
  }

  return Object.freeze(issues);
}
