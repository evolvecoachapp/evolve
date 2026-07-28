import type {
  ApplicationInfo,
  ApplicationReleaseChannel,
} from "../models/ApplicationInfo";

export interface BuildApplicationInfoInput {
  readonly appId: string;
  readonly name: string;
  readonly version: string;
  readonly buildNumber?: string | null;
  readonly channel?: ApplicationReleaseChannel;
}

/**
 * Builds an immutable ApplicationInfo.
 */
export function buildApplicationInfo(
  input: BuildApplicationInfoInput,
): ApplicationInfo {
  return Object.freeze({
    appId: input.appId.trim(),
    name: input.name.trim(),
    version: input.version.trim(),
    buildNumber: input.buildNumber ?? null,
    channel: input.channel ?? "production",
  });
}
