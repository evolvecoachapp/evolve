import type { ToolInput } from "../../tool-calling/models/ToolInput";

/**
 * Read a named parameter from ToolInput.
 * Mapping helper only — no domain validation.
 */
export function extractParameter(
  input: ToolInput,
  name: string,
): unknown {
  return input.parameters[name];
}

export function extractObjectParameter(
  input: ToolInput,
  name: string,
): Readonly<Record<string, unknown>> | null {
  const value = extractParameter(input, name);
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }
  return value as Readonly<Record<string, unknown>>;
}

/**
 * Cast a mapped object payload to a domain type.
 * Structural translation only — no runtime shape enforcement beyond object checks.
 */
export function asDomainPayload<T>(
  value: Readonly<Record<string, unknown>> | null | undefined,
): T | null {
  if (value == null) {
    return null;
  }
  return value as unknown as T;
}

export function hasParameter(input: ToolInput, name: string): boolean {
  return Object.prototype.hasOwnProperty.call(input.parameters, name);
}
