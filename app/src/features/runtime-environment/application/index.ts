import type { ApplicationInfo } from "../models/ApplicationInfo";
import type { Capabilities } from "../models/Capabilities";
import type { ConnectivityInfo } from "../models/ConnectivityInfo";
import type { PlatformInfo } from "../models/PlatformInfo";
import type { RuntimeEnvironment } from "../models/RuntimeEnvironment";
import type {
  RuntimeEnvironmentResult,
  RuntimeEnvironmentValidation,
} from "../models/RuntimeEnvironmentResult";
import {
  createRuntimeEnvironmentService,
  type RuntimeEnvironmentService,
  type RuntimeEnvironmentServiceDeps,
} from "../services/RuntimeEnvironmentService";
import type { BuildRuntimeEnvironmentInput } from "../services/buildRuntimeEnvironment";

function resolveService(
  service: RuntimeEnvironmentService | undefined,
  deps: RuntimeEnvironmentServiceDeps | undefined,
): RuntimeEnvironmentService {
  if (service) return service;
  return createRuntimeEnvironmentService(deps ?? {});
}

type BuildInput = Omit<
  BuildRuntimeEnvironmentInput,
  "generatedAt" | "version" | "schemaVersion" | "validationOptions"
> & {
  readonly generatedAt?: string;
};

/** Public API — compose Runtime Environment from explicit environment fields. */
export function composeRuntimeEnvironment(options: {
  readonly input: BuildInput;
  readonly service?: RuntimeEnvironmentService;
  readonly deps?: RuntimeEnvironmentServiceDeps;
}): RuntimeEnvironmentResult {
  return resolveService(options.service, options.deps).build(options.input);
}

/** Application API — full Runtime Environment. */
export function getRuntimeEnvironment(options: {
  readonly service?: RuntimeEnvironmentService;
  readonly deps?: RuntimeEnvironmentServiceDeps;
} = {}): RuntimeEnvironment | null {
  return resolveService(options.service, options.deps).getRuntimeEnvironment();
}

/** Application API — capability descriptors. */
export function getCapabilities(options: {
  readonly service?: RuntimeEnvironmentService;
  readonly deps?: RuntimeEnvironmentServiceDeps;
} = {}): Capabilities | null {
  return resolveService(options.service, options.deps).getCapabilities();
}

/** Application API — platform info. */
export function getPlatformInfo(options: {
  readonly service?: RuntimeEnvironmentService;
  readonly deps?: RuntimeEnvironmentServiceDeps;
} = {}): PlatformInfo | null {
  return resolveService(options.service, options.deps).getPlatformInfo();
}

/** Application API — application info. */
export function getApplicationInfo(options: {
  readonly service?: RuntimeEnvironmentService;
  readonly deps?: RuntimeEnvironmentServiceDeps;
} = {}): ApplicationInfo | null {
  return resolveService(options.service, options.deps).getApplicationInfo();
}

/** Application API — connectivity model. */
export function getConnectivityInfo(options: {
  readonly service?: RuntimeEnvironmentService;
  readonly deps?: RuntimeEnvironmentServiceDeps;
} = {}): ConnectivityInfo | null {
  return resolveService(options.service, options.deps).getConnectivityInfo();
}

/** Public API — validate latest Runtime Environment. */
export function validateRuntimeEnvironmentLatest(options: {
  readonly service?: RuntimeEnvironmentService;
  readonly deps?: RuntimeEnvironmentServiceDeps;
} = {}): RuntimeEnvironmentValidation {
  return resolveService(options.service, options.deps).validate();
}

export type { RuntimeEnvironmentServiceDeps };
