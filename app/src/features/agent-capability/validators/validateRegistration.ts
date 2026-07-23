import type { CapabilityRegistration } from "../models/CapabilityRegistration";
import type {
  CapabilityValidation,
  CapabilityValidationIssue,
} from "../models/CapabilityValidation";
import { CapabilityValidationCodes } from "../models/CapabilityValidation";
import { freezeValidation } from "../utils/FreezeCapabilityState";
import { validateCapabilityId } from "./validateCapabilityId";
import { validateDescriptor } from "./validateDescriptor";

/**
 * Validates a capability registration.
 */
export function validateRegistration(
  registration: CapabilityRegistration | null | undefined,
): CapabilityValidation {
  const issues: CapabilityValidationIssue[] = [];

  if (!registration) {
    issues.push(
      Object.freeze({
        code: CapabilityValidationCodes.REGISTRATION_INVALID,
        message: "Capability registration is required.",
        path: "registration",
      }),
    );
    return freezeValidation({ valid: false, issues: Object.freeze(issues) });
  }

  if (!registration.id || registration.id.trim().length === 0) {
    issues.push(
      Object.freeze({
        code: CapabilityValidationCodes.MISSING_FIELD,
        message: "Registration id is required.",
        path: "registration.id",
      }),
    );
  }

  const idValidation = validateCapabilityId(
    registration.capabilityId,
    "registration.capabilityId",
  );
  issues.push(...idValidation.issues);

  if (!registration.agentId || registration.agentId.trim().length === 0) {
    issues.push(
      Object.freeze({
        code: CapabilityValidationCodes.MISSING_FIELD,
        message: "Owning agent id is required.",
        path: "registration.agentId",
      }),
    );
  }

  if (!registration.registeredAt || registration.registeredAt.trim().length === 0) {
    issues.push(
      Object.freeze({
        code: CapabilityValidationCodes.MISSING_FIELD,
        message: "Registration registeredAt is required.",
        path: "registration.registeredAt",
      }),
    );
  }

  const descriptorValidation = validateDescriptor(registration.descriptor);
  issues.push(...descriptorValidation.issues);

  if (
    registration.descriptor &&
    registration.capabilityId &&
    registration.descriptor.id !== registration.capabilityId
  ) {
    issues.push(
      Object.freeze({
        code: CapabilityValidationCodes.REGISTRY_INCONSISTENT,
        message: "Registration capabilityId must match descriptor.id.",
        path: "registration.descriptor.id",
      }),
    );
  }

  const operations =
    registration.supportedOperations.length > 0
      ? registration.supportedOperations
      : registration.descriptor?.supportedOperations ?? [];

  if (operations.length === 0) {
    issues.push(
      Object.freeze({
        code: CapabilityValidationCodes.MISSING_FIELD,
        message: "Registration must declare at least one supported operation.",
        path: "registration.supportedOperations",
      }),
    );
  }

  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
