import type { WorkoutAdaptationInput } from "../models/WorkoutAdaptationInput";

export function uniqueSorted(keys: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(keys)].sort());
}

export function collectKeys(...groups: readonly (readonly string[])[]): readonly string[] {
  const keys = new Set<string>();
  for (const group of groups) {
    for (const k of group) keys.add(k);
  }
  return Object.freeze([...keys].sort());
}

export function collectPresentSignalKeys(input: WorkoutAdaptationInput): readonly string[] {
  const keys = new Set<string>();
  for (const k of input.signalKeys) keys.add(k);
  for (const k of input.decisionKeys) keys.add(k);
  for (const [flag, present] of Object.entries(input.signalFlags)) {
    if (present) keys.add(flag);
  }
  return Object.freeze([...keys].sort());
}

export function keysPresent(keys: readonly string[], prefix?: string): readonly string[] {
  if (!prefix) return uniqueSorted(keys);
  return uniqueSorted(keys.filter((k) => k.startsWith(prefix)));
}
