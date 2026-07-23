import type { RoutingRequest } from "../models/RoutingRequest";
import {
  RoutingValidationCodes,
  type RoutingValidation,
  type RoutingValidationIssue,
} from "../models/RoutingValidation";
import { isNonEmptyString } from "../utils/RoutingHelpers";

export function validateRoutingRequest(
  request: RoutingRequest,
): RoutingValidation {
  const issues: RoutingValidationIssue[] = [];

  if (!isNonEmptyString(request.id)) {
    issues.push({
      code: RoutingValidationCodes.INVALID_REQUEST,
      message: "Routing request id is required.",
      path: "id",
    });
  }
  if (!isNonEmptyString(request.coachAgentId)) {
    issues.push({
      code: RoutingValidationCodes.INVALID_REQUEST,
      message: "coachAgentId is required.",
      path: "coachAgentId",
    });
  }
  if (!isNonEmptyString(request.intent)) {
    issues.push({
      code: RoutingValidationCodes.INVALID_REQUEST,
      message: "intent is required.",
      path: "intent",
    });
  }
  if (request.requiredCapabilities.length === 0) {
    issues.push({
      code: RoutingValidationCodes.EMPTY_PLAN,
      message: "At least one required capability must be provided.",
      path: "requiredCapabilities",
    });
  }

  const seen = new Set<string>();
  for (const capability of request.requiredCapabilities) {
    if (!isNonEmptyString(capability.capabilityId)) {
      issues.push({
        code: RoutingValidationCodes.INVALID_REQUEST,
        message: "capabilityId is required.",
        path: "requiredCapabilities.capabilityId",
      });
      continue;
    }
    if (seen.has(capability.capabilityId)) {
      issues.push({
        code: RoutingValidationCodes.DUPLICATE_CAPABILITY,
        message: `Duplicate capability: ${capability.capabilityId}`,
        path: "requiredCapabilities",
      });
    }
    seen.add(capability.capabilityId);
  }

  return Object.freeze({
    valid: issues.length === 0,
    issues: Object.freeze(issues.map((issue) => Object.freeze(issue))),
  });
}
