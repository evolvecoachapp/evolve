/**
 * Synchronization policy representations only — no execution logic.
 */
export const SYNCHRONIZATION_POLICIES = [
  "Manual",
  "Immediate",
  "OfflineFirst",
  "WiFiOnly",
  "Background",
  "Disabled",
] as const;

export type SynchronizationPolicy = (typeof SYNCHRONIZATION_POLICIES)[number];

export function isSynchronizationPolicy(
  value: string,
): value is SynchronizationPolicy {
  return (SYNCHRONIZATION_POLICIES as readonly string[]).includes(value);
}

export function createSynchronizationPolicy(
  policy: SynchronizationPolicy = "Manual",
): SynchronizationPolicy {
  return policy;
}
