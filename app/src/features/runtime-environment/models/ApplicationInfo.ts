/**
 * Immutable application descriptors for Runtime Environment (Sprint 29.2).
 */
export type ApplicationReleaseChannel =
  | "development"
  | "staging"
  | "production"
  | "test";

export interface ApplicationInfo {
  readonly appId: string;
  readonly name: string;
  readonly version: string;
  readonly buildNumber: string | null;
  readonly channel: ApplicationReleaseChannel;
}
