export type ReleaseChannel = "development" | "preview" | "production";

/** Installed app version metadata used for compatibility checks and support. */
export interface AppVersion {
  version: string;
  buildNumber: string;
  releaseChannel: ReleaseChannel;
  minimumSupportedVersion: string | null;
  updateAvailable: boolean;
}
