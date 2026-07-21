import type { ConfigurationValidationIssue } from "../models/ConfigurationValidationResult";
import type { ModelConfiguration } from "../models/ModelConfiguration";

/**
 * Validate model configuration.
 *
 * Returns structured issues; never throws for validation failures.
 */
export function validateModel(
  model: ModelConfiguration,
): readonly ConfigurationValidationIssue[] {
  const issues: ConfigurationValidationIssue[] = [];

  if (model.id == null || typeof model.id !== "string") {
    issues.push(
      Object.freeze({
        field: "model.id",
        code: "missing_model",
      }),
    );
    return Object.freeze(issues);
  }

  if (model.id.trim().length === 0) {
    issues.push(
      Object.freeze({
        field: "model.id",
        code: "invalid_model",
      }),
    );
  }

  return Object.freeze(issues);
}
