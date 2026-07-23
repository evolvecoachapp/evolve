import type { CoachSupervisorRequest } from "../models/CoachSupervisorRequest";
import type { CoachSupervisorValidation } from "../models/CoachSupervisorValidation";
import { applyCapabilityPolicy } from "../policies/CapabilityPolicy";

export function validateCapabilities(
  request: CoachSupervisorRequest,
): CoachSupervisorValidation {
  return applyCapabilityPolicy(request);
}
