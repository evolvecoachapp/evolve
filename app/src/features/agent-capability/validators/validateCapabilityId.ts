import type { CapabilityId } from "../models/CapabilityId";
import type {
  CapabilityValidation,
  CapabilityValidationIssue,
} from "../models/CapabilityValidation";
import { CapabilityValidationCodes } from "../models/CapabilityValidation";
import { freezeValidation } from "../utils/FreezeCapabilityState";

const CAPABILITY_ID_PATTERN = /^[A-Za-z][A-Za-z0-9_]*$/;

/**
 * Validates a capability identifier.
 */
export function validateCapabilityId(
  capabilityId: CapabilityId | null | undefined,
  path = "capabilityId",
): CapabilityValidation {
  const issues: CapabilityValidationIssue[] = [];

  if (!capabilityId || capabilityId.trim().length === 0) {
    issues.push(
      Object.freeze({
        code: CapabilityValidationCodes.MISSING_FIELD,
        message: "Capability id is required.",
        path,
      }),
    );
  } else if (!CAPABILITY_ID_PATTERN.test(capabilityId)) {
    issues.push(
      Object.freeze({
        code: CapabilityValidationCodes.INVALID_IDENTIFIER,
        message:
          "Capability id must start with a letter and contain only letters, numbers, or underscores.",
        path,
      }),
    );
  }

  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
