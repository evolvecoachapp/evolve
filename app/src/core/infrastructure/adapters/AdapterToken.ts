/**
 * Canonical infrastructure adapter contract tokens.
 */
export const ADAPTER_TOKENS = [
  "storage",
  "authentication",
  "notification",
  "analytics",
  "synchronization",
  "logging",
  "feature-flag",
  "health-platform",
  "media",
  "export",
  "import",
  "clock",
  "identifier-generator",
  "configuration",
  "backend",
] as const;

export type AdapterToken = (typeof ADAPTER_TOKENS)[number];

export function isAdapterToken(value: string): value is AdapterToken {
  return (ADAPTER_TOKENS as readonly string[]).includes(value);
}
