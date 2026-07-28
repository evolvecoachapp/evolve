import type { Capabilities } from "../models/Capabilities";

export interface BuildCapabilitiesInput {
  readonly supportsNotifications?: boolean;
  readonly supportsOffline?: boolean;
  readonly supportsBiometrics?: boolean;
  readonly supportsBackgroundSync?: boolean;
  readonly supportsHealthIntegration?: boolean;
  readonly supportsCamera?: boolean;
  readonly supportsMicrophone?: boolean;
  /** Optional explicit capability ids; otherwise derived from enabled flags. */
  readonly capabilityIds?: readonly string[];
}

const FLAG_TO_ID: ReadonlyArray<readonly [keyof BuildCapabilitiesInput, string]> =
  [
    ["supportsNotifications", "notifications"],
    ["supportsOffline", "offline"],
    ["supportsBiometrics", "biometrics"],
    ["supportsBackgroundSync", "background_sync"],
    ["supportsHealthIntegration", "health_integration"],
    ["supportsCamera", "camera"],
    ["supportsMicrophone", "microphone"],
  ];

/**
 * Builds immutable Capabilities descriptors (no hardware queries).
 */
export function buildCapabilities(
  input: BuildCapabilitiesInput = {},
): Capabilities {
  const supportsNotifications = input.supportsNotifications ?? false;
  const supportsOffline = input.supportsOffline ?? false;
  const supportsBiometrics = input.supportsBiometrics ?? false;
  const supportsBackgroundSync = input.supportsBackgroundSync ?? false;
  const supportsHealthIntegration = input.supportsHealthIntegration ?? false;
  const supportsCamera = input.supportsCamera ?? false;
  const supportsMicrophone = input.supportsMicrophone ?? false;

  const derived: string[] = [];
  const flagValues: Record<string, boolean> = {
    supportsNotifications,
    supportsOffline,
    supportsBiometrics,
    supportsBackgroundSync,
    supportsHealthIntegration,
    supportsCamera,
    supportsMicrophone,
  };
  for (const [flag, id] of FLAG_TO_ID) {
    if (flagValues[flag]) {
      derived.push(id);
    }
  }

  const capabilityIds = Object.freeze(
    [...(input.capabilityIds ?? derived)].map((id) => id.trim()).filter(Boolean),
  );

  return Object.freeze({
    supportsNotifications,
    supportsOffline,
    supportsBiometrics,
    supportsBackgroundSync,
    supportsHealthIntegration,
    supportsCamera,
    supportsMicrophone,
    capabilityIds,
  });
}
