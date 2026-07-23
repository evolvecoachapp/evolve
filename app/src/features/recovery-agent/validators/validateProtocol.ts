import type { RecoveryProtocolHint } from "../models/RecoveryPlan";
import type { RecoveryValidation } from "../models/RecoveryValidation";
import { RecoveryValidationCodes } from "../models/RecoveryValidation";
import { freezeValidation } from "../utils/FreezeRecoveryState";

const ALLOWED = new Set([
  "rest",
  "active",
  "deload",
  "sleep_focus",
  "stress_focus",
  "mixed",
  "unknown",
]);

export function validateProtocol(
  protocol: RecoveryProtocolHint,
): RecoveryValidation {
  const issues = [];
  if (!ALLOWED.has(protocol)) {
    issues.push(
      Object.freeze({
        code: RecoveryValidationCodes.INVALID_PROTOCOL,
        message: `Unknown protocol: ${protocol}`,
        path: "protocolHint",
      }),
    );
  }
  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
