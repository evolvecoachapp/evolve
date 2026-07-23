import type { AdapterContext } from "../models/AdapterContext";

export function freezeAttributes(
  attributes: Readonly<Record<string, unknown>>,
): Readonly<Record<string, unknown>> {
  return Object.freeze({ ...attributes });
}

export function freezeAdapterContext(context: AdapterContext): AdapterContext {
  return Object.freeze({
    ...context,
    executionContext: Object.freeze({
      ...context.executionContext,
      attributes: freezeAttributes(context.executionContext.attributes),
    }),
    attributes: freezeAttributes(context.attributes),
  });
}

/**
 * Shallow-freeze a plain object payload for immutable mapping.
 * Non-objects / null are returned as-is.
 */
export function freezePayload<T>(value: T): T {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    return Object.freeze(value.map((item) => freezePayload(item))) as T;
  }
  const frozen: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(
    value as Record<string, unknown>,
  )) {
    frozen[key] = entry;
  }
  return Object.freeze(frozen) as T;
}
