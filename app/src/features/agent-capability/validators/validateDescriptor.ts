import type { CapabilityDescriptor } from "../models/CapabilityDescriptor";
import type {
  CapabilityValidation,
  CapabilityValidationIssue,
} from "../models/CapabilityValidation";
import { CapabilityValidationCodes } from "../models/CapabilityValidation";
import { freezeValidation } from "../utils/FreezeCapabilityState";
import { validateCapabilityId } from "./validateCapabilityId";

/**
 * Validates a capability descriptor.
 */
export function validateDescriptor(
  descriptor: CapabilityDescriptor | null | undefined,
): CapabilityValidation {
  const issues: CapabilityValidationIssue[] = [];

  if (!descriptor) {
    issues.push(
      Object.freeze({
        code: CapabilityValidationCodes.DESCRIPTOR_INVALID,
        message: "Capability descriptor is required.",
        path: "descriptor",
      }),
    );
    return freezeValidation({ valid: false, issues: Object.freeze(issues) });
  }

  const idValidation = validateCapabilityId(descriptor.id, "descriptor.id");
  issues.push(...idValidation.issues);

  if (!descriptor.name || descriptor.name.trim().length === 0) {
    issues.push(
      Object.freeze({
        code: CapabilityValidationCodes.MISSING_FIELD,
        message: "Descriptor name is required.",
        path: "descriptor.name",
      }),
    );
  }

  if (!descriptor.description || descriptor.description.trim().length === 0) {
    issues.push(
      Object.freeze({
        code: CapabilityValidationCodes.MISSING_FIELD,
        message: "Descriptor description is required.",
        path: "descriptor.description",
      }),
    );
  }

  if (!descriptor.category || descriptor.category.trim().length === 0) {
    issues.push(
      Object.freeze({
        code: CapabilityValidationCodes.MISSING_FIELD,
        message: "Descriptor category is required.",
        path: "descriptor.category",
      }),
    );
  }

  if (
    !descriptor.supportedOperations ||
    descriptor.supportedOperations.length === 0
  ) {
    issues.push(
      Object.freeze({
        code: CapabilityValidationCodes.MISSING_FIELD,
        message: "Descriptor must declare at least one supported operation.",
        path: "descriptor.supportedOperations",
      }),
    );
  } else {
    for (let i = 0; i < descriptor.supportedOperations.length; i++) {
      const operation = descriptor.supportedOperations[i];
      if (!operation || operation.trim().length === 0) {
        issues.push(
          Object.freeze({
            code: CapabilityValidationCodes.INVALID_VALUE,
            message: "Supported operation must be a non-empty string.",
            path: `descriptor.supportedOperations[${i}]`,
          }),
        );
      }
    }
  }

  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
