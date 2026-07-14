export type DevicePlatform = "ios" | "android" | "web";

/** Runtime device and locale metadata for diagnostics and feature gating. */
export interface DeviceInfo {
  platform: DevicePlatform;
  osVersion: string;
  appInstallId: string;
  deviceModel: string | null;
  locale: string;
  timezone: string;
}
