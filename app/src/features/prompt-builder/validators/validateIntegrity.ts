import type { PromptPackage } from "../models/PromptPackage";
import { isValidPromptPriority } from "../models/PromptPriority";

/**
 * Validate package integrity (ids, duplicates, priorities, linkage).
 */
export function validateIntegrity(
  promptPackage: PromptPackage,
): readonly string[] {
  const issues: string[] = [];

  if (!promptPackage.id) {
    issues.push("package_missing_id");
  }
  if (!promptPackage.conversationContextId) {
    issues.push("package_missing_conversation_context_id");
  }
  if (
    promptPackage.context.conversationContextId !==
    promptPackage.conversationContextId
  ) {
    issues.push("context_conversation_id_mismatch");
  }

  const ids = new Set<string>();
  const types = new Set<string>();
  for (const block of promptPackage.blocks) {
    if (ids.has(block.id)) {
      issues.push(`duplicate_block_id:${block.id}`);
    } else {
      ids.add(block.id);
    }
    if (types.has(block.type)) {
      issues.push(`duplicate_block_type:${block.type}`);
    } else {
      types.add(block.type);
    }
    if (!isValidPromptPriority(block.priority)) {
      issues.push(`invalid_block_priority:${block.id}`);
    }
  }

  if (promptPackage.systemPrompt.role !== "system") {
    issues.push("system_prompt_invalid_role");
  }
  if (promptPackage.userPrompt.role !== "user") {
    issues.push("user_prompt_invalid_role");
  }

  return issues;
}
