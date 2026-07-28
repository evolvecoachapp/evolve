import { isLogScope, type LogScope } from "./LogScope";

/**
 * Immutable logging context.
 */
export interface LogContext {
  readonly scope: LogScope;
  readonly attributes: Readonly<Record<string, string>>;
}

export function createLogContext(input: {
  readonly scope: LogScope;
  readonly attributes?: Readonly<Record<string, string>>;
}): LogContext {
  return Object.freeze({
    scope: input.scope,
    attributes: Object.freeze({ ...(input.attributes ?? {}) }),
  });
}

export function isValidLogContext(
  context: LogContext | null | undefined,
): boolean {
  if (!context || typeof context !== "object") {
    return false;
  }
  if (!isLogScope(context.scope)) {
    return false;
  }
  if (
    !context.attributes ||
    typeof context.attributes !== "object" ||
    Array.isArray(context.attributes)
  ) {
    return false;
  }
  return true;
}
