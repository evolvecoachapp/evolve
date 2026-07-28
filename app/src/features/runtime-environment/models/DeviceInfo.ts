/**
 * Immutable device descriptors for Runtime Environment (Sprint 29.2).
 *
 * Representation only — does not query hardware or platform APIs.
 */
export type DeviceFormFactor =
  | "phone"
  | "tablet"
  | "desktop"
  | "wearable"
  | "unknown";

export interface DeviceInfo {
  readonly deviceId: string;
  readonly model: string | null;
  readonly manufacturer: string | null;
  readonly osVersion: string | null;
  readonly formFactor: DeviceFormFactor;
}
