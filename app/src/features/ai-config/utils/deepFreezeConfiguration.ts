import type { AIConfiguration } from "../models/AIConfiguration";

/**
 * Deep-freeze an AIConfiguration tree.
 *
 * Returns the same object reference after freezing nested plain objects.
 */
export function deepFreezeConfiguration(
  configuration: AIConfiguration,
): AIConfiguration {
  return deepFreeze(configuration) as AIConfiguration;
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
