import type { ToolArgument } from "../models/ToolArgument";

/**
 * Normalize arguments: trim names, drop empties, stable name sort.
 */
export function normalizeArguments(
  args: readonly ToolArgument[],
): readonly ToolArgument[] {
  const normalized = args
    .filter((arg) => arg && typeof arg.name === "string")
    .map((arg) =>
      Object.freeze({
        name: arg.name.trim(),
        value: cloneValue(arg.value),
      }),
    )
    .filter((arg) => arg.name.length > 0)
    .sort((left, right) => left.name.localeCompare(right.name));

  return Object.freeze(normalized);
}

function cloneValue(value: unknown): unknown {
  if (value === null || typeof value !== "object") {
    return value;
  }
  if (Array.isArray(value)) {
    return Object.freeze(value.map((item) => cloneValue(item)));
  }
  const entries = Object.entries(value as Record<string, unknown>).map(
    ([key, entryValue]) => [key, cloneValue(entryValue)],
  );
  return Object.freeze(Object.fromEntries(entries));
}
