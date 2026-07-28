import type { ApplicationInfo } from "./ApplicationInfo";
import type { Capabilities } from "./Capabilities";
import type { ConnectivityInfo } from "./ConnectivityInfo";
import type { DeviceInfo } from "./DeviceInfo";
import type { EnvironmentMetadata } from "./EnvironmentMetadata";
import type { FeatureSupport } from "./FeatureSupport";
import type { LocaleInfo } from "./LocaleInfo";
import type { PlatformInfo } from "./PlatformInfo";

/**
 * Immutable Runtime Environment (Sprint 29.2).
 *
 * Execution-environment foundation for future Auth / Cloud Sync / Push /
 * Offline Cache / Feature Flags / Analytics / Telemetry / Device Sync /
 * Coach Portal. Not infrastructure. Not React Native. Not Expo.
 * Not platform APIs.
 */
export interface RuntimeEnvironment {
  readonly id: string;
  readonly device: DeviceInfo;
  readonly platform: PlatformInfo;
  readonly application: ApplicationInfo;
  readonly capabilities: Capabilities;
  readonly featureSupport: FeatureSupport;
  readonly locale: LocaleInfo;
  readonly connectivity: ConnectivityInfo;
  readonly metadata: EnvironmentMetadata;
  readonly createdAt: string;
}
