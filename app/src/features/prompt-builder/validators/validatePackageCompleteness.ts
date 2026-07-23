import type { PromptPackage } from "../models/PromptPackage";

/**
 * Validate package completeness (required aggregates present).
 */
export function validatePackageCompleteness(
  promptPackage: PromptPackage,
): readonly string[] {
  const issues: string[] = [];

  if (!promptPackage.persona?.id) {
    issues.push("missing_persona");
  }
  if (!promptPackage.capabilities?.id) {
    issues.push("missing_capabilities");
  }
  if (!promptPackage.knowledge?.id) {
    issues.push("missing_knowledge");
  }
  if (!promptPackage.safety?.id) {
    issues.push("missing_safety");
  }
  if (!promptPackage.formatting?.id) {
    issues.push("missing_formatting");
  }
  if (!promptPackage.systemPrompt?.id) {
    issues.push("missing_system_prompt");
  }
  if (!promptPackage.userPrompt?.id) {
    issues.push("missing_user_prompt");
  }
  if (!promptPackage.summary?.packageId) {
    issues.push("missing_summary");
  }
  if (!promptPackage.composition?.id) {
    issues.push("missing_composition");
  }
  if (!promptPackage.statistics) {
    issues.push("missing_statistics");
  }
  if (promptPackage.blocks.length === 0) {
    issues.push("empty_blocks");
  }
  if (promptPackage.sections.length === 0) {
    issues.push("empty_sections");
  }

  return issues;
}
