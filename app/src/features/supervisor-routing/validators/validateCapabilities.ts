import type { CapabilityRegistryPort } from "../contracts/CapabilityRegistryPort";
import type { RoutingCapability } from "../models/RoutingCapability";
import {
  RoutingValidationCodes,
  type RoutingValidation,
  type RoutingValidationIssue,
} from "../models/RoutingValidation";

export function validateCapabilities(input: {
  readonly capabilities: readonly RoutingCapability[];
  readonly registry: CapabilityRegistryPort;
}): RoutingValidation {
  const issues: RoutingValidationIssue[] = [];

  for (const capability of input.capabilities) {
    const record = input.registry.lookup(capability.capabilityId);
    if (!record) {
      if (capability.required) {
        issues.push({
          code: RoutingValidationCodes.MISSING_CAPABILITY,
          message: `Capability not found: ${capability.capabilityId}`,
          path: "capabilities",
        });
      } else {
        issues.push({
          code: RoutingValidationCodes.UNRESOLVED_CAPABILITY,
          message: `Optional capability unresolved: ${capability.capabilityId}`,
          path: "capabilities",
        });
      }
      continue;
    }
    if (!record.enabled && capability.required) {
      issues.push({
        code: RoutingValidationCodes.DISABLED_CAPABILITY,
        message: `Capability disabled: ${capability.capabilityId}`,
        path: "capabilities",
      });
    }
  }

  return Object.freeze({
    valid: issues.every(
      (issue) => issue.code !== RoutingValidationCodes.MISSING_CAPABILITY &&
        issue.code !== RoutingValidationCodes.DISABLED_CAPABILITY,
    ),
    issues: Object.freeze(issues.map((issue) => Object.freeze(issue))),
  });
}
