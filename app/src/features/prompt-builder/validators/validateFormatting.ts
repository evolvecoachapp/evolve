import type { PromptPackage } from "../models/PromptPackage";

/**
 * Validate formatting integrity (non-empty statements, normalized style).
 */
export function validateFormatting(
  promptPackage: PromptPackage,
): readonly string[] {
  const issues: string[] = [];

  for (const block of promptPackage.blocks) {
    if (!block.statement || block.statement.trim().length === 0) {
      issues.push(`block_empty_statement:${block.id}`);
    }
    if (/\s{2,}/.test(block.statement)) {
      issues.push(`block_unnormalized_whitespace:${block.id}`);
    }
  }

  if (!promptPackage.formatting.style) {
    issues.push("formatting_missing_style");
  }

  if (promptPackage.formatting.rules.length === 0) {
    issues.push("formatting_missing_rules");
  }

  return issues;
}
