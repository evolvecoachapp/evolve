import type { PromptPackage } from "../models/PromptPackage";
import { validateFormatting } from "./validateFormatting";
import { validateIntegrity } from "./validateIntegrity";
import { validateMissingBlocks } from "./validateMissingBlocks";
import { validateOrdering } from "./validateOrdering";
import { validatePackageCompleteness } from "./validatePackageCompleteness";
import { validateRequiredSections } from "./validateRequiredSections";

/**
 * Orchestrate all PromptPackage validators.
 */
export function validatePromptPackage(
  promptPackage: PromptPackage,
): readonly string[] {
  return Object.freeze([
    ...validateMissingBlocks(promptPackage),
    ...validateRequiredSections(promptPackage),
    ...validateOrdering(promptPackage),
    ...validateFormatting(promptPackage),
    ...validateIntegrity(promptPackage),
    ...validatePackageCompleteness(promptPackage),
  ]);
}
