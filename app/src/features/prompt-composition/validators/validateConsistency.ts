import type { PromptPackage } from "../models/PromptPackage";

/**
 * Validate package-level consistency across structured models and blocks.
 */
export function validatePackageConsistency(
  promptPackage: PromptPackage,
): readonly string[] {
  const issues: string[] = [];

  if (promptPackage.conversationContextId !== promptPackage.context.conversationContextId) {
    issues.push("package_context_id_mismatch");
  }

  if (promptPackage.identity.id && !promptPackage.blocks.some((b) => b.type === "identity")) {
    issues.push("package_identity_block_missing");
  }

  if (
    promptPackage.summary.packageId !== promptPackage.id
  ) {
    issues.push("package_summary_id_mismatch");
  }

  if (
    promptPackage.summary.conversationContextId !==
    promptPackage.conversationContextId
  ) {
    issues.push("package_summary_context_id_mismatch");
  }

  if (promptPackage.summary.blockCount !== promptPackage.blocks.length) {
    issues.push("package_summary_block_count_mismatch");
  }

  if (promptPackage.knowledge.conversationContextId !== promptPackage.conversationContextId) {
    issues.push("package_knowledge_context_id_mismatch");
  }

  if (
    promptPackage.conversation.conversationContextId !==
    promptPackage.conversationContextId
  ) {
    issues.push("package_conversation_context_id_mismatch");
  }

  return issues;
}
