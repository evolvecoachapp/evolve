import type { BuildRuntimeEnvironmentInput } from "../services/buildRuntimeEnvironment";
import {
  createRuntimeEnvironmentService,
  type RuntimeEnvironmentService,
} from "../services/RuntimeEnvironmentService";

export const FIXED_RUNTIME_TIMESTAMP = "2026-07-28T14:00:00.000Z";

export function createMinimalRuntimeInput(
  overrides: Partial<BuildRuntimeEnvironmentInput> & {
    readonly requestId?: string;
  } = {},
): BuildRuntimeEnvironmentInput {
  const requestId = overrides.requestId ?? "req:runtime:1";

  return {
    requestId,
    generatedAt: overrides.generatedAt ?? FIXED_RUNTIME_TIMESTAMP,
    version: overrides.version ?? "29.2",
    schemaVersion: overrides.schemaVersion ?? "1.0",
    device: overrides.device ?? {
      deviceId: "device:1",
      model: "Test Device",
      manufacturer: "EVOLVE",
      osVersion: "18.0",
      formFactor: "phone",
    },
    platform: overrides.platform ?? {
      kind: "ios",
      version: "18.0",
    },
    application: overrides.application ?? {
      appId: "com.evolve.app",
      name: "EVOLVE",
      version: "0.6.0",
      buildNumber: "100",
      channel: "test",
    },
    capabilities: overrides.capabilities ?? {
      supportsNotifications: true,
      supportsOffline: true,
      supportsBiometrics: false,
      supportsBackgroundSync: true,
      supportsHealthIntegration: false,
      supportsCamera: false,
      supportsMicrophone: false,
    },
    featureSupport: overrides.featureSupport ?? {
      featureKeys: Object.freeze(["coaching", "workout_runtime"]),
    },
    locale: overrides.locale ?? {
      languageTag: "en-US",
    },
    connectivity: overrides.connectivity ?? {
      status: "online",
    },
    validationOptions: overrides.validationOptions,
  };
}

export function createTestRuntimeEnvironmentService(
  clock: () => string = () => FIXED_RUNTIME_TIMESTAMP,
): RuntimeEnvironmentService {
  return createRuntimeEnvironmentService({
    clock,
    version: "29.2",
    schemaVersion: "1.0",
  });
}
