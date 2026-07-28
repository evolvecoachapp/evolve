import type { ApplicationInfo } from "../models/ApplicationInfo";
import type { Capabilities } from "../models/Capabilities";
import type { ConnectivityInfo } from "../models/ConnectivityInfo";
import type { DeviceInfo } from "../models/DeviceInfo";
import type { FeatureSupport } from "../models/FeatureSupport";
import type { LocaleInfo } from "../models/LocaleInfo";
import type { PlatformInfo } from "../models/PlatformInfo";
import type { RuntimeEnvironment } from "../models/RuntimeEnvironment";
import type { RuntimeEnvironmentResult } from "../models/RuntimeEnvironmentResult";
import {
  buildApplicationInfo,
  type BuildApplicationInfoInput,
} from "./buildApplicationInfo";
import {
  buildCapabilities,
  type BuildCapabilitiesInput,
} from "./buildCapabilities";
import {
  buildConnectivityInfo,
  type BuildConnectivityInfoInput,
} from "./buildConnectivityInfo";
import {
  buildDeviceInfo,
  type BuildDeviceInfoInput,
} from "./buildDeviceInfo";
import {
  buildFeatureSupport,
  type BuildFeatureSupportInput,
} from "./buildFeatureSupport";
import {
  buildLocaleInfo,
  type BuildLocaleInfoInput,
} from "./buildLocaleInfo";
import {
  buildPlatformInfo,
  type BuildPlatformInfoInput,
} from "./buildPlatformInfo";
import {
  validateRuntimeEnvironment,
  type ValidateRuntimeEnvironmentOptions,
} from "./validateRuntimeEnvironment";

export interface BuildRuntimeEnvironmentInput {
  readonly requestId: string;
  readonly generatedAt: string;
  readonly version?: string;
  readonly schemaVersion?: string;
  readonly device: BuildDeviceInfoInput | DeviceInfo;
  readonly platform: BuildPlatformInfoInput | PlatformInfo;
  readonly application: BuildApplicationInfoInput | ApplicationInfo;
  readonly capabilities?: BuildCapabilitiesInput | Capabilities;
  readonly featureSupport?: BuildFeatureSupportInput | FeatureSupport;
  readonly locale: BuildLocaleInfoInput | LocaleInfo;
  readonly connectivity?: BuildConnectivityInfoInput | ConnectivityInfo;
  readonly validationOptions?: ValidateRuntimeEnvironmentOptions;
}

function isDeviceInfo(
  value: BuildDeviceInfoInput | DeviceInfo,
): value is DeviceInfo {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.isFrozen(value) &&
    "deviceId" in value &&
    "model" in value &&
    "manufacturer" in value &&
    "osVersion" in value &&
    "formFactor" in value
  );
}

function isPlatformInfo(
  value: BuildPlatformInfoInput | PlatformInfo,
): value is PlatformInfo {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.isFrozen(value) &&
    "kind" in value &&
    "name" in value &&
    "version" in value
  );
}

function isApplicationInfo(
  value: BuildApplicationInfoInput | ApplicationInfo,
): value is ApplicationInfo {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.isFrozen(value) &&
    "appId" in value &&
    "name" in value &&
    "version" in value &&
    "buildNumber" in value &&
    "channel" in value
  );
}

function isCapabilities(
  value: BuildCapabilitiesInput | Capabilities,
): value is Capabilities {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.isFrozen(value) &&
    "supportsNotifications" in value &&
    "supportsOffline" in value &&
    "supportsBiometrics" in value &&
    "supportsBackgroundSync" in value &&
    "supportsHealthIntegration" in value &&
    "supportsCamera" in value &&
    "supportsMicrophone" in value &&
    "capabilityIds" in value
  );
}

function isFeatureSupport(
  value: BuildFeatureSupportInput | FeatureSupport,
): value is FeatureSupport {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.isFrozen(value) &&
    "featureKeys" in value
  );
}

function isLocaleInfo(
  value: BuildLocaleInfoInput | LocaleInfo,
): value is LocaleInfo {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.isFrozen(value) &&
    "languageTag" in value &&
    "language" in value &&
    "region" in value &&
    "script" in value
  );
}

function isConnectivityInfo(
  value: BuildConnectivityInfoInput | ConnectivityInfo,
): value is ConnectivityInfo {
  return (
    typeof value === "object" &&
    value !== null &&
    Object.isFrozen(value) &&
    "status" in value
  );
}

/**
 * Composes the complete immutable Runtime Environment.
 */
export function buildRuntimeEnvironment(
  input: BuildRuntimeEnvironmentInput,
): RuntimeEnvironmentResult {
  const version = input.version ?? "29.2";
  const schemaVersion = input.schemaVersion ?? "1.0";
  const runtimeId = `runtime-environment:${input.requestId}`;

  const device = isDeviceInfo(input.device)
    ? input.device
    : buildDeviceInfo(input.device);
  const platform = isPlatformInfo(input.platform)
    ? input.platform
    : buildPlatformInfo(input.platform);
  const application = isApplicationInfo(input.application)
    ? input.application
    : buildApplicationInfo(input.application);
  const capabilities =
    input.capabilities && isCapabilities(input.capabilities)
      ? input.capabilities
      : buildCapabilities(input.capabilities ?? {});
  const featureSupport =
    input.featureSupport && isFeatureSupport(input.featureSupport)
      ? input.featureSupport
      : buildFeatureSupport(input.featureSupport ?? {});
  const locale = isLocaleInfo(input.locale)
    ? input.locale
    : buildLocaleInfo(input.locale);
  const connectivity =
    input.connectivity && isConnectivityInfo(input.connectivity)
      ? input.connectivity
      : buildConnectivityInfo(input.connectivity ?? {});

  const metadata = Object.freeze({
    generatedAt: input.generatedAt,
    version,
    runtimeId,
    schemaVersion,
  });

  const runtime: RuntimeEnvironment = Object.freeze({
    id: runtimeId,
    device,
    platform,
    application,
    capabilities,
    featureSupport,
    locale,
    connectivity,
    metadata,
    createdAt: input.generatedAt,
  });

  const validation = validateRuntimeEnvironment(
    runtime,
    input.validationOptions,
  );
  if (!validation.valid) {
    return Object.freeze({
      id: `runtime-environment-result:${input.requestId}:invalid`,
      success: false,
      runtime: null,
      platform: null,
      application: null,
      capabilities: null,
      metadata: null,
      validation,
      message: `Runtime environment validation failed: ${validation.errors.join("; ")}`,
      generatedAt: input.generatedAt,
    });
  }

  return Object.freeze({
    id: `runtime-environment-result:${input.requestId}`,
    success: true,
    runtime,
    platform,
    application,
    capabilities,
    metadata,
    validation,
    message:
      "Runtime environment composed deterministically as an immutable foundation.",
    generatedAt: input.generatedAt,
  });
}
