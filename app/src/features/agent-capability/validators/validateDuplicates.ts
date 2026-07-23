import type { CapabilityRegistration } from "../models/CapabilityRegistration";
import type {
  CapabilityValidation,
  CapabilityValidationIssue,
} from "../models/CapabilityValidation";
import { CapabilityValidationCodes } from "../models/CapabilityValidation";
import { freezeValidation } from "../utils/FreezeCapabilityState";
import { createCapabilityUniquenessPolicy } from "../policies/CapabilityUniquenessPolicy";

/**
 * Validates duplicate capability registrations.
 */
export function validateDuplicates(
  registrations: readonly CapabilityRegistration[],
  candidate?: CapabilityRegistration | null,
): CapabilityValidation {
  const issues: CapabilityValidationIssue[] = [];
  const uniqueness = createCapabilityUniquenessPolicy();

  const all = candidate
    ? Object.freeze([...registrations, candidate])
    : registrations;

  const duplicates = uniqueness.findDuplicates(all);
  for (const capabilityId of duplicates) {
    issues.push(
      Object.freeze({
        code: CapabilityValidationCodes.DUPLICATE_CAPABILITY,
        message: `Duplicate capabilityId: ${capabilityId}`,
        path: `registrations[${capabilityId}]`,
      }),
    );
  }

  if (candidate) {
    const existing = registrations.find(
      (item) => item.capabilityId === candidate.capabilityId,
    );
    if (existing) {
      issues.push(
        Object.freeze({
          code: CapabilityValidationCodes.DUPLICATE_CAPABILITY,
          message: `Capability already registered: ${candidate.capabilityId}`,
          path: "registration.capabilityId",
        }),
      );
    }
  }

  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
