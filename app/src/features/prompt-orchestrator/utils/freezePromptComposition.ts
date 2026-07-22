import type { PromptComposition } from "../models/PromptComposition";

/**
 * Deep-freeze a PromptComposition tree for immutable handoff.
 */
export function freezePromptComposition(
  composition: PromptComposition,
): PromptComposition {
  return deepFreeze(composition) as PromptComposition;
}

function deepFreeze<T>(value: T): T {
  if (value === null || typeof value !== "object") {
    return value;
  }

  const record = value as Record<string, unknown>;
  for (const key of Object.keys(record)) {
    const child = record[key];
    if (child !== null && typeof child === "object") {
      deepFreeze(child);
    }
  }

  return Object.freeze(value);
}
