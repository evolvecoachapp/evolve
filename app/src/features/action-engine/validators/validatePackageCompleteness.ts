import type { ActionPackage } from "../models/ActionPackage";
import type { ActionValidationIssue } from "../models/ActionValidation";
import { ActionValidationCodes } from "../models/ActionValidation";
import { freezeValidationIssue } from "../utils/freezeActionPlan";

function issue(
  code: ActionValidationIssue["code"],
  message: string,
  path: string | null = null,
): ActionValidationIssue {
  return freezeValidationIssue({ code, message, path });
}

/**
 * Validate ActionPackage completeness (planning package only).
 */
export function validatePackageCompleteness(
  pkg: ActionPackage,
): readonly ActionValidationIssue[] {
  const issues: ActionValidationIssue[] = [];

  if (!pkg.plan) {
    issues.push(
      issue(
        ActionValidationCodes.PACKAGE_INCOMPLETE,
        "Package requires plan",
        "plan",
      ),
    );
  }

  if (!pkg.context) {
    issues.push(
      issue(
        ActionValidationCodes.PACKAGE_INCOMPLETE,
        "Package requires context",
        "context",
      ),
    );
  }

  if (!pkg.snapshot) {
    issues.push(
      issue(
        ActionValidationCodes.PACKAGE_INCOMPLETE,
        "Package requires snapshot",
        "snapshot",
      ),
    );
  }

  if (!pkg.createdAt.trim()) {
    issues.push(
      issue(
        ActionValidationCodes.PACKAGE_INCOMPLETE,
        "Package createdAt is required",
        "createdAt",
      ),
    );
  }

  if (pkg.plan && pkg.context) {
    if (pkg.plan.sourceResponseId !== pkg.context.sourceResponseId) {
      issues.push(
        issue(
          ActionValidationCodes.PACKAGE_INCOMPLETE,
          "Plan and context sourceResponseId must match",
          "context.sourceResponseId",
        ),
      );
    }
  }

  return Object.freeze(issues);
}
