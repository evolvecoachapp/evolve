import type { AdapterCapability } from "../contracts/AdapterCapability";
import type { AdapterRegistration } from "../registry/AdapterRegistration";
import { createAdapterRegistration } from "../registry/AdapterRegistration";
import { ADAPTER_TOKENS, type AdapterToken } from "../adapters/AdapterToken";

export const INFRASTRUCTURE_ADAPTER_CONTRACT_VERSION = "1.0.0";
export const INFRASTRUCTURE_ADAPTER_SCHEMA_VERSION = "1";

const ADAPTER_NAMES: Readonly<Record<AdapterToken, string>> = Object.freeze({
  storage: "StorageAdapter",
  authentication: "AuthenticationAdapter",
  notification: "NotificationAdapter",
  analytics: "AnalyticsAdapter",
  synchronization: "SynchronizationAdapter",
  logging: "LoggingAdapter",
  "feature-flag": "FeatureFlagAdapter",
  "health-platform": "HealthPlatformAdapter",
  media: "MediaAdapter",
  export: "ExportAdapter",
  import: "ImportAdapter",
  clock: "ClockAdapter",
  "identifier-generator": "IdentifierGenerator",
  configuration: "ConfigurationProvider",
  backend: "BackendAdapter",
});

const ADAPTER_DEFAULT_CAPABILITIES = {
  storage: [
    "supportsTransactions",
    "supportsOffline",
    "supportsEncryption",
  ],
  authentication: ["supportsBiometrics", "supportsOffline"],
  notification: ["supportsPush", "supportsScheduling"],
  analytics: ["supportsOffline"],
  synchronization: ["supportsOffline", "supportsEncryption"],
  logging: ["supportsOffline"],
  "feature-flag": ["supportsOffline"],
  "health-platform": ["supportsHealthData", "supportsOffline"],
  media: ["supportsMedia", "supportsOffline"],
  export: ["supportsExport"],
  import: ["supportsImport"],
  clock: [],
  "identifier-generator": [],
  configuration: ["supportsOffline"],
  backend: ["supportsOffline"],
} as const satisfies Record<AdapterToken, readonly AdapterCapability[]>;

/** Canonical infrastructure adapter contract registrations (metadata only). */
export function createDefaultAdapterRegistrations(): readonly AdapterRegistration[] {
  return Object.freeze(
    ADAPTER_TOKENS.map((token) =>
      createAdapterRegistration({
        token,
        name: ADAPTER_NAMES[token],
        version: INFRASTRUCTURE_ADAPTER_CONTRACT_VERSION,
        capabilities: ADAPTER_DEFAULT_CAPABILITIES[token],
        metadata: Object.freeze({
          layer: "infrastructure-adapter-contracts",
          kind: "adapter",
        }),
      }),
    ),
  );
}
