import type { PromptPackage } from "../models/PromptPackage";
import { PromptSections } from "../models/PromptSection";

const REQUIRED_SECTIONS = Object.freeze([
  PromptSections.SYSTEM,
  PromptSections.PERSONA,
  PromptSections.SAFETY,
  PromptSections.CONSTRAINT,
  PromptSections.KNOWLEDGE,
  PromptSections.CONVERSATION,
  PromptSections.ATHLETE,
  PromptSections.SUMMARY,
]);

/**
 * Validate required sections are present.
 */
export function validateRequiredSections(
  promptPackage: PromptPackage,
): readonly string[] {
  const present = new Set(promptPackage.sections);
  const issues: string[] = [];
  for (const section of REQUIRED_SECTIONS) {
    if (!present.has(section)) {
      issues.push(`missing_required_section:${section}`);
    }
  }
  return issues;
}
