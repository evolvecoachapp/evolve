export const DecisionErrorCodes = {
  INVALID_INPUT: "invalid_input",
  MISSING_CONTEXT: "missing_context",
  VALIDATION_FAILED: "validation_failed",
  RESOLUTION_FAILED: "resolution_failed",
  INTERNAL: "internal",
} as const;

export type DecisionErrorCode =
  (typeof DecisionErrorCodes)[keyof typeof DecisionErrorCodes];

export interface DecisionError {
  readonly code: DecisionErrorCode;
  readonly message: string;
  readonly details: readonly string[];
}

export function createDecisionError(
  code: DecisionErrorCode,
  message: string,
  details: readonly string[] = [],
): DecisionError {
  return Object.freeze({
    code,
    message,
    details: Object.freeze([...details]),
  });
}
