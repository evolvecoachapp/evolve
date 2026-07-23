import type { PromptContext } from "../models/coach/PromptContext";
import {
  validatePromptContext,
  type PromptValidationCode,
} from "./validatePromptContext";

export class PromptBuilderError extends Error {
  readonly code: string;
  readonly issues: readonly PromptValidationCode[];

  constructor(issues: readonly PromptValidationCode[]) {
    super(`Invalid composed PromptContext: ${issues.join(",")}`);
    this.name = "PromptBuilderError";
    this.code = "invalid_prompt_context";
    this.issues = issues;
  }
}

/**
 * Accept an already composed PromptContext from Prompt Orchestrator.
 *
 * Validates structure only — never rebuilds from domains, never formats,
 * never calls providers.
 */
export function receiveComposedPromptContext(
  promptContext: PromptContext,
): PromptContext {
  const issues = validatePromptContext(promptContext);
  if (issues.length > 0) {
    throw new PromptBuilderError(issues);
  }
  return promptContext;
}
