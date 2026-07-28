import type { DeviceFormFactor, DeviceInfo } from "../models/DeviceInfo";

export interface BuildDeviceInfoInput {
  readonly deviceId: string;
  readonly model?: string | null;
  readonly manufacturer?: string | null;
  readonly osVersion?: string | null;
  readonly formFactor?: DeviceFormFactor;
}

/**
 * Builds an immutable DeviceInfo.
 */
export function buildDeviceInfo(input: BuildDeviceInfoInput): DeviceInfo {
  return Object.freeze({
    deviceId: input.deviceId.trim(),
    model: input.model ?? null,
    manufacturer: input.manufacturer ?? null,
    osVersion: input.osVersion ?? null,
    formFactor: input.formFactor ?? "unknown",
  });
}
