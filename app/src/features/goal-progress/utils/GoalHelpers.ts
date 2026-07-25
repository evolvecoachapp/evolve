import type { GoalProgressInput } from "../models/GoalProgressInput";

export function collectPresentSignalKeys(input: GoalProgressInput): readonly string[] {
  const keys = new Set<string>();
  for (const k of input.stateKeys) keys.add(k);
  for (const k of input.performanceKeys) keys.add(k);
  for (const k of input.recoveryKeys) keys.add(k);
  for (const k of input.nutritionKeys) keys.add(k);
  for (const k of input.goalKeys) keys.add(k);
  for (const k of input.adherenceKeys) keys.add(k);
  for (const k of input.historyKeys) keys.add(k);
  for (const k of input.timelineKeys) keys.add(k);
  for (const [flag, present] of Object.entries(input.signalFlags)) {
    if (present) keys.add(flag);
  }
  return Object.freeze([...keys].sort());
}

export function countPresentFlags(flags: Readonly<Record<string, boolean>>): number {
  let n = 0;
  for (const v of Object.values(flags)) if (v) n += 1;
  return n;
}

export function uniqueSorted(keys: readonly string[]): readonly string[] {
  return Object.freeze([...new Set(keys)].sort());
}

export function keysPresent(keys: readonly string[], prefix?: string): readonly string[] {
  if (!prefix) return uniqueSorted(keys);
  return uniqueSorted(keys.filter((k) => k.startsWith(prefix)));
}
