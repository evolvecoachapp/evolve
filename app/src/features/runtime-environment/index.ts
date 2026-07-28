/**
 * Runtime Environment Foundation (Sprint 29.2).
 *
 * Immutable execution-environment layer for future Auth / Cloud Sync / Push /
 * Offline Cache / Feature Flags / Analytics / Telemetry / Device Sync /
 * Coach Portal. Not infrastructure. Not React Native. Not Expo.
 * Not platform APIs.
 */

export * from "./models";
export * from "./services";
export {
  composeRuntimeEnvironment,
  getRuntimeEnvironment,
  getCapabilities,
  getPlatformInfo,
  getApplicationInfo,
  getConnectivityInfo,
  validateRuntimeEnvironmentLatest,
} from "./application";
