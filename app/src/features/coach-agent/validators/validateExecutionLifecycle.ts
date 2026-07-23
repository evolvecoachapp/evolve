import type { CoachExecutionState } from "../models/CoachExecutionState";
import { CoachExecutionStatuses } from "../models/CoachExecutionState";
import type {
  CoachValidation,
  CoachValidationIssue,
} from "../models/CoachValidation";
import { CoachValidationCodes } from "../models/CoachValidation";
import { freezeValidation } from "../utils/FreezeCoachState";

const VALID_STATUSES = new Set<string>(Object.values(CoachExecutionStatuses));

/**
 * Validates Coach Agent execution lifecycle state.
 */
export function validateExecutionLifecycle(
  state: CoachExecutionState | null | undefined,
): CoachValidation {
  const issues: CoachValidationIssue[] = [];

  if (!state) {
    issues.push(
      Object.freeze({
        code: CoachValidationCodes.MISSING_FIELD,
        message: "Execution state is required.",
        path: "state",
      }),
    );
    return freezeValidation({ valid: false, issues: Object.freeze(issues) });
  }

  if (!state.id) {
    issues.push(
      Object.freeze({
        code: CoachValidationCodes.MISSING_FIELD,
        message: "State id is required.",
        path: "state.id",
      }),
    );
  }

  if (!VALID_STATUSES.has(state.status)) {
    issues.push(
      Object.freeze({
        code: CoachValidationCodes.LIFECYCLE_INVALID,
        message: `Unknown execution status: ${String(state.status)}`,
        path: "state.status",
      }),
    );
  }

  if (
    (state.status === CoachExecutionStatuses.COMPLETED ||
      state.status === CoachExecutionStatuses.FAILED) &&
    !state.requestId
  ) {
    issues.push(
      Object.freeze({
        code: CoachValidationCodes.LIFECYCLE_INVALID,
        message: "Terminal states require a requestId.",
        path: "state.requestId",
      }),
    );
  }

  if (!state.updatedAt) {
    issues.push(
      Object.freeze({
        code: CoachValidationCodes.MISSING_FIELD,
        message: "updatedAt is required.",
        path: "state.updatedAt",
      }),
    );
  }

  return freezeValidation({
    valid: issues.length === 0,
    issues: Object.freeze(issues),
  });
}
