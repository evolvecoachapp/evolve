import type { AppVersion, DeviceInfo } from "../models";

/** App and device metadata contract for compatibility and diagnostics. */
export interface VersionService {
  getAppVersion(): AppVersion;

  getDeviceInfo(): DeviceInfo;

  isUpdateRequired(): boolean;
}

export class VersionServiceError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "VersionServiceError";
  }
}
