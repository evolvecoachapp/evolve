import type { ApplicationInfo } from "../models/ApplicationInfo";
import type { Capabilities } from "../models/Capabilities";
import type { ConnectivityInfo } from "../models/ConnectivityInfo";
import type { LocaleInfo } from "../models/LocaleInfo";
import type { PlatformInfo } from "../models/PlatformInfo";
import type { RuntimeEnvironment } from "../models/RuntimeEnvironment";
import type { RuntimeEnvironmentValidation } from "../models/RuntimeEnvironmentResult";

const LANGUAGE_TAG_PATTERN =
  /^[A-Za-z]{2,3}(-[A-Za-z]{4})?(-[A-Za-z]{2}|-[0-9]{3})?(-[A-Za-z0-9]{5,8})*$/;

const VALID_PLATFORMS = new Set(["ios", "android", "web", "unknown"]);
const VALID_CHANNELS = new Set([
  "development",
  "staging",
  "production",
  "test",
]);
const VALID_CONNECTIVITY = new Set(["online", "offline", "metered", "unknown"]);
const APP_VERSION_PATTERN = /^\d+(\.\d+){0,3}([-+][A-Za-z0-9.-]+)?$/;

function isFrozen(value: unknown): boolean {
  return typeof value === "object" && value !== null && Object.isFrozen(value);
}

function isValidLanguageTag(languageTag: string): boolean {
  if (!languageTag || !LANGUAGE_TAG_PATTERN.test(languageTag)) {
    return false;
  }
  try {
    const canonical = Intl.getCanonicalLocales(languageTag);
    return canonical.length > 0;
  } catch {
    return false;
  }
}

function validatePlatform(
  platform: PlatformInfo | null | undefined,
  errors: string[],
): void {
  if (!platform) {
    errors.push("Platform is required");
    return;
  }
  if (!VALID_PLATFORMS.has(platform.kind)) {
    errors.push(`Invalid platform: ${String(platform.kind)}`);
  }
  if (!platform.name) {
    errors.push("Platform name is required");
  }
}

function validateLocale(
  locale: LocaleInfo | null | undefined,
  errors: string[],
): void {
  if (!locale) {
    errors.push("Locale is required");
    return;
  }
  if (!locale.languageTag) {
    errors.push("Locale languageTag is required");
  } else if (!isValidLanguageTag(locale.languageTag)) {
    errors.push(`Invalid locale: ${locale.languageTag}`);
  }
  if (!locale.language) {
    errors.push("Locale language is required");
  }
}

function validateCapabilities(
  capabilities: Capabilities | null | undefined,
  errors: string[],
): void {
  if (!capabilities) {
    errors.push("Capabilities are required");
    return;
  }
  if (!capabilities.capabilityIds) {
    errors.push("Capabilities capabilityIds are required");
    return;
  }
  const seen = new Set<string>();
  for (const id of capabilities.capabilityIds) {
    if (!id) {
      errors.push("Capability id must not be empty");
      continue;
    }
    if (seen.has(id)) {
      errors.push(`Duplicate capabilities: ${id}`);
    }
    seen.add(id);
  }
}

function validateApplication(
  application: ApplicationInfo | null | undefined,
  errors: string[],
): void {
  if (!application) {
    errors.push("Application is required");
    return;
  }
  if (!application.appId) {
    errors.push("Application appId is required");
  }
  if (!application.name) {
    errors.push("Application name is required");
  }
  if (!application.version) {
    errors.push("Application version is required");
  } else if (!APP_VERSION_PATTERN.test(application.version)) {
    errors.push(`Invalid app version: ${application.version}`);
  }
  if (!VALID_CHANNELS.has(application.channel)) {
    errors.push(`Invalid application channel: ${String(application.channel)}`);
  }
}

function validateConnectivity(
  connectivity: ConnectivityInfo | null | undefined,
  errors: string[],
): void {
  if (!connectivity) {
    errors.push("Connectivity is required");
    return;
  }
  if (!VALID_CONNECTIVITY.has(connectivity.status)) {
    errors.push(`Invalid connectivity: ${String(connectivity.status)}`);
  }
}

export interface ValidateRuntimeEnvironmentOptions {
  readonly knownRuntimeIds?: ReadonlySet<string>;
}

/**
 * Validates the immutable Runtime Environment.
 */
export function validateRuntimeEnvironment(
  runtime: RuntimeEnvironment | null | undefined,
  options: ValidateRuntimeEnvironmentOptions = {},
): RuntimeEnvironmentValidation {
  const errors: string[] = [];

  if (!runtime) {
    return Object.freeze({
      valid: false,
      errors: Object.freeze(["Runtime environment is missing"]),
    });
  }

  if (!runtime.id) errors.push("Runtime id is required");
  if (!runtime.createdAt) errors.push("Runtime createdAt is required");

  if (!runtime.device) {
    errors.push("Device is required");
  } else if (!runtime.device.deviceId) {
    errors.push("Device deviceId is required");
  }

  if (!runtime.featureSupport) {
    errors.push("FeatureSupport is required");
  } else if (!runtime.featureSupport.featureKeys) {
    errors.push("FeatureSupport featureKeys are required");
  }

  if (!runtime.metadata) {
    errors.push("Metadata is required");
  }

  validatePlatform(runtime.platform, errors);
  validateLocale(runtime.locale, errors);
  validateCapabilities(runtime.capabilities, errors);
  validateApplication(runtime.application, errors);
  validateConnectivity(runtime.connectivity, errors);

  if (runtime.metadata) {
    if (!runtime.metadata.runtimeId) {
      errors.push("Metadata runtimeId is required");
    } else if (runtime.metadata.runtimeId !== runtime.id) {
      errors.push("Metadata runtimeId must match runtime id");
    }
    if (!runtime.metadata.generatedAt) {
      errors.push("Metadata generatedAt is required");
    }
    if (!runtime.metadata.version) {
      errors.push("Metadata version is required");
    }
    if (!runtime.metadata.schemaVersion) {
      errors.push("Metadata schemaVersion is required");
    }
  }

  if (runtime.id && options.knownRuntimeIds?.has(runtime.id)) {
    errors.push(`Duplicate runtime: ${runtime.id}`);
  }

  const requiredFrozen: Array<[string, unknown]> = [
    ["device", runtime.device],
    ["platform", runtime.platform],
    ["application", runtime.application],
    ["capabilities", runtime.capabilities],
    ["featureSupport", runtime.featureSupport],
    ["locale", runtime.locale],
    ["connectivity", runtime.connectivity],
    ["metadata", runtime.metadata],
    ["runtime", runtime],
  ];
  for (const [name, value] of requiredFrozen) {
    if (value == null) {
      errors.push(`Null immutable field: ${name}`);
    } else if (!isFrozen(value)) {
      errors.push(`${name} must be immutable`);
    }
  }

  if (runtime.capabilities && !isFrozen(runtime.capabilities.capabilityIds)) {
    errors.push("capabilities.capabilityIds must be immutable");
  }
  if (
    runtime.featureSupport &&
    !isFrozen(runtime.featureSupport.featureKeys)
  ) {
    errors.push("featureSupport.featureKeys must be immutable");
  }

  return Object.freeze({
    valid: errors.length === 0,
    errors: Object.freeze(errors),
  });
}

export function assertRuntimeEnvironmentImmutable(
  runtime: RuntimeEnvironment,
): void {
  if (!Object.isFrozen(runtime)) {
    throw new Error("RuntimeEnvironment must be frozen");
  }
}
