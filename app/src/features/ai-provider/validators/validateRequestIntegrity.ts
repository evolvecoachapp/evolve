import type { AIRequest } from "../models/AIRequest";
import { validateExecutionOptions } from "./validateExecutionOptions";
import { validateModelSelection } from "./validateModelSelection";
import { validateProviderId } from "./validateProviderId";

/**
 * Soft-validate AIRequest integrity before provider resolution.
 */
export function validateRequestIntegrity(
  request: AIRequest | null | undefined,
): readonly string[] {
  const issues: string[] = [];

  if (!request) {
    issues.push("request_missing");
    return issues;
  }

  if (!request.id || request.id.trim().length === 0) {
    issues.push("request_id_missing");
  }

  if (!request.promptPackageId || request.promptPackageId.trim().length === 0) {
    issues.push("request_prompt_package_id_missing");
  }

  if (!request.promptPackage) {
    issues.push("request_prompt_package_missing");
  } else if (
    request.promptPackageId &&
    request.promptPackage.id !== request.promptPackageId
  ) {
    issues.push("request_prompt_package_id_mismatch");
  } else if (
    request.promptPackage.blocks.length === 0
  ) {
    issues.push("request_prompt_package_empty_blocks");
  }

  if (!request.createdAt) {
    issues.push("request_created_at_missing");
  }

  if (request.providerId) {
    issues.push(...validateProviderId(request.providerId));
  }

  issues.push(...validateExecutionOptions(request.options));
  issues.push(
    ...validateModelSelection({
      model: request.model,
    }),
  );

  return issues;
}
