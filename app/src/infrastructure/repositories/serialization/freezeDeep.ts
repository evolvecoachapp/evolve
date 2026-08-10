/**
 * Recursively freeze plain objects restored from JSON.
 * Infrastructure-only — no domain validation.
 */
export function freezeDeep<T>(value: T): T {
  if (value === null || typeof value !== "object") {
    return value;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      freezeDeep(item);
    }
    return Object.freeze(value) as T;
  }

  for (const key of Object.keys(value as object)) {
    const property = (value as Record<string, unknown>)[key];
    if (property !== null && typeof property === "object") {
      freezeDeep(property);
    }
  }

  return Object.freeze(value) as T;
}
