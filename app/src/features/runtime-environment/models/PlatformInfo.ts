/**
 * Immutable platform descriptors for Runtime Environment (Sprint 29.2).
 *
 * Representation only — not React Native / Expo / platform APIs.
 */
export type PlatformKind = "ios" | "android" | "web" | "unknown";

export interface PlatformInfo {
  readonly kind: PlatformKind;
  readonly name: string;
  readonly version: string | null;
}
