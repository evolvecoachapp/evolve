import type { SessionRequest } from "../models/SessionRequest";
import type { SessionStatus } from "../models/SessionState";
import type { SessionValidation } from "../models/SessionValidation";
import { applyLifecyclePolicy } from "../policies/LifecyclePolicy";

export function validateTransitions(input: {
  readonly request: SessionRequest;
  readonly from: SessionStatus | null;
}): SessionValidation {
  return applyLifecyclePolicy({
    request: input.request,
    currentStatus: input.from,
  });
}
