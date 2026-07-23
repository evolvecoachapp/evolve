import type { CapabilityPolicy } from "../models/CapabilityPolicy";
import { CapabilityPolicyKinds } from "../models/CapabilityPolicy";
import type { CapabilityRegistration } from "../models/CapabilityRegistration";
import type {
  CapabilityValidation,
  CapabilityValidationIssue,
} from "../models/CapabilityValidation";
import { CapabilityValidationCodes } from "../models/CapabilityValidation";
import { freezeValidation } from "../utils/FreezeCapabilityState";
import { createCapabilityUniquenessPolicy } from "./CapabilityUniquenessPolicy";
import { createCapabilityOwnershipPolicy } from "./CapabilityOwnershipPolicy";

/**
 * Registry consistency policy — structural integrity only.
 */
export interface RegistryConsistencyPolicy {
  readonly policy: CapabilityPolicy;
  check(
    registrations: readonly CapabilityRegistration[],
  ): CapabilityValidation;
}

export class DefaultRegistryConsistencyPolicy
  implements RegistryConsistencyPolicy
{
  readonly policy: CapabilityPolicy = Object.freeze({
    id: "policy:capability:consistency:default",
    kind: CapabilityPolicyKinds.CONSISTENCY,
    name: "Default Registry Consistency",
    description:
      "Ensures unique capabilityIds, consistent descriptor ids, and no ownership conflicts.",
    enabled: true,
  });

  private readonly uniqueness = createCapabilityUniquenessPolicy();
  private readonly ownership = createCapabilityOwnershipPolicy();

  check(
    registrations: readonly CapabilityRegistration[],
  ): CapabilityValidation {
    const issues: CapabilityValidationIssue[] = [];

    const duplicates = this.uniqueness.findDuplicates(registrations);
    for (const capabilityId of duplicates) {
      issues.push(
        Object.freeze({
          code: CapabilityValidationCodes.DUPLICATE_CAPABILITY,
          message: `Duplicate capabilityId in registry: ${capabilityId}`,
          path: `registrations[${capabilityId}]`,
        }),
      );
    }

    for (let i = 0; i < registrations.length; i++) {
      const registration = registrations[i];
      if (registration.descriptor.id !== registration.capabilityId) {
        issues.push(
          Object.freeze({
            code: CapabilityValidationCodes.REGISTRY_INCONSISTENT,
            message:
              "Registration capabilityId must match descriptor.id.",
            path: `registrations[${i}].descriptor.id`,
          }),
        );
      }

      if (
        this.ownership.conflictsWith(
          registrations.filter((_, index) => index !== i),
          registration,
        )
      ) {
        issues.push(
          Object.freeze({
            code: CapabilityValidationCodes.OWNERSHIP_CONFLICT,
            message: `Ownership conflict for capabilityId: ${registration.capabilityId}`,
            path: `registrations[${i}].agentId`,
          }),
        );
      }

      if (
        registration.supportedOperations.length === 0 &&
        registration.descriptor.supportedOperations.length === 0
      ) {
        issues.push(
          Object.freeze({
            code: CapabilityValidationCodes.REGISTRY_INCONSISTENT,
            message: "Registration must declare at least one supported operation.",
            path: `registrations[${i}].supportedOperations`,
          }),
        );
      }
    }

    return freezeValidation({
      valid: issues.length === 0,
      issues: Object.freeze(issues),
    });
  }
}

export function createRegistryConsistencyPolicy(): RegistryConsistencyPolicy {
  return new DefaultRegistryConsistencyPolicy();
}
