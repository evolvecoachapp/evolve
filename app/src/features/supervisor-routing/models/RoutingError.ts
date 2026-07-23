import type { RoutingValidationCode } from "./RoutingValidation";

/**
 * Immutable routing error.
 */
export interface RoutingError {
  readonly code: RoutingValidationCode | string;
  readonly message: string;
  readonly path: string | null;
}

export function createRoutingError(input: {
  readonly code: RoutingValidationCode | string;
  readonly message: string;
  readonly path?: string | null;
}): RoutingError {
  return Object.freeze({
    code: input.code,
    message: input.message,
    path: input.path ?? null,
  });
}
