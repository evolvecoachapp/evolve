/**
 * Supported infrastructure adapter capability descriptors.
 * Descriptors only — no runtime probing, no I/O.
 */
export const ADAPTER_CAPABILITIES = [
  "supportsTransactions",
  "supportsOffline",
  "supportsEncryption",
  "supportsScheduling",
  "supportsBiometrics",
  "supportsMedia",
  "supportsHealthData",
  "supportsPush",
  "supportsExport",
  "supportsImport",
] as const;

export type AdapterCapability = (typeof ADAPTER_CAPABILITIES)[number];

export function isAdapterCapability(
  value: string,
): value is AdapterCapability {
  return (ADAPTER_CAPABILITIES as readonly string[]).includes(value);
}
