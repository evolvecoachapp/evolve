import type { CapabilityRegistration } from "../models/CapabilityRegistration";
import type { CapabilityValidation } from "../models/CapabilityValidation";
import { createRegistryConsistencyPolicy } from "../policies/RegistryConsistencyPolicy";
import { validateRegistration } from "./validateRegistration";
import { freezeValidation } from "../utils/FreezeCapabilityState";

/**
 * Validates full registry consistency (deterministic).
 */
export function validateRegistryConsistency(
  registrations: readonly CapabilityRegistration[],
): CapabilityValidation {
  const issues = [];

  for (let i = 0; i < registrations.length; i++) {
    const result = validateRegistration(registrations[i]);
    for (const issue of result.issues) {
      issues.push(
        Object.freeze({
          ...issue,
          path: issue.path.startsWith("registration")
            ? issue.path.replace(/^registration/, `registrations[${i}]`)
            : `registrations[${i}].${issue.path}`,
        }),
      );
    }
  }

  const consistency = createRegistryConsistencyPolicy().check(registrations);
  issues.push(...consistency.issues);

  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
