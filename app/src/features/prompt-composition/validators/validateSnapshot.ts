import type { PromptSnapshot } from "../models/PromptSnapshot";
import {
  validateBlockConsistency,
  validateBlockOrdering,
  validateBlockPriorities,
  validateDuplicateBlocks,
  validateMissingMandatoryBlocks,
} from "./validateBlocks";
import { validateCompositionInput } from "./validateComposition";
import { validatePackageConsistency } from "./validateConsistency";

/**
 * Validate full snapshot integrity (soft issues).
 */
export function validateSnapshotIntegrity(
  snapshot: PromptSnapshot,
): readonly string[] {
  const issues: string[] = [];

  if (!snapshot.id) {
    issues.push("snapshot_missing_id");
  }
  if (!snapshot.frozenAt) {
    issues.push("snapshot_missing_frozen_at");
  }
  if (!snapshot.promptPackage.id) {
    issues.push("package_missing_id");
  }
  if (snapshot.summary.packageId !== snapshot.promptPackage.id) {
    issues.push("snapshot_summary_package_id_mismatch");
  }
  if (!snapshot.promptPackage.frozenAt) {
    issues.push("package_missing_frozen_at");
  }

  issues.push(
    ...validatePackageConsistency(snapshot.promptPackage),
    ...validateBlockConsistency(snapshot.promptPackage.blocks),
    ...validateDuplicateBlocks(snapshot.promptPackage.blocks),
    ...validateMissingMandatoryBlocks(snapshot.promptPackage.blocks),
    ...validateBlockOrdering(snapshot.promptPackage.blocks),
    ...validateBlockPriorities(snapshot.promptPackage.blocks),
  );

  return issues;
}

/**
 * Convenience re-export for composition-time soft validation.
 */
export { validateCompositionInput };
