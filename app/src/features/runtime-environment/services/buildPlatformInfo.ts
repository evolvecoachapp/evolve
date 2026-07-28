import type { PlatformInfo, PlatformKind } from "../models/PlatformInfo";

export interface BuildPlatformInfoInput {
  readonly kind: PlatformKind;
  readonly name?: string;
  readonly version?: string | null;
}

const PLATFORM_NAMES: Record<PlatformKind, string> = {
  ios: "iOS",
  android: "Android",
  web: "Web",
  unknown: "Unknown",
};

/**
 * Builds an immutable PlatformInfo.
 */
export function buildPlatformInfo(input: BuildPlatformInfoInput): PlatformInfo {
  return Object.freeze({
    kind: input.kind,
    name: (input.name ?? PLATFORM_NAMES[input.kind]).trim(),
    version: input.version ?? null,
  });
}
