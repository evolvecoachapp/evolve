import type { ApplicationInfo } from "../models/ApplicationInfo";
import type { Capabilities } from "../models/Capabilities";
import type { ConnectivityInfo } from "../models/ConnectivityInfo";
import type { PlatformInfo } from "../models/PlatformInfo";
import type { RuntimeEnvironment } from "../models/RuntimeEnvironment";
import type { RuntimeEnvironmentResult } from "../models/RuntimeEnvironmentResult";
import {
  buildRuntimeEnvironment,
  type BuildRuntimeEnvironmentInput,
} from "./buildRuntimeEnvironment";
import { validateRuntimeEnvironment } from "./validateRuntimeEnvironment";

export interface RuntimeEnvironmentServiceDeps {
  readonly clock?: () => string;
  readonly version?: string;
  readonly schemaVersion?: string;
}

type RuntimeBuildInput = Omit<
  BuildRuntimeEnvironmentInput,
  "generatedAt" | "version" | "schemaVersion" | "validationOptions"
> & {
  readonly generatedAt?: string;
};

/**
 * Runtime Environment composition facade (Sprint 29.2).
 * Compose only — holds latest runtime environment in memory.
 */
export class RuntimeEnvironmentService {
  private readonly clock: () => string;
  private readonly version: string;
  private readonly schemaVersion: string;
  private latest: RuntimeEnvironment | null = null;
  private readonly runtimeIds = new Set<string>();

  constructor(deps: RuntimeEnvironmentServiceDeps = {}) {
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.version = deps.version ?? "29.2";
    this.schemaVersion = deps.schemaVersion ?? "1.0";
  }

  build(input: RuntimeBuildInput): RuntimeEnvironmentResult {
    const generatedAt = input.generatedAt ?? this.clock();
    const previous = this.latest;
    const knownRuntimeIds = new Set(this.runtimeIds);
    if (previous) {
      knownRuntimeIds.delete(previous.id);
    }

    const result = buildRuntimeEnvironment({
      ...input,
      generatedAt,
      version: this.version,
      schemaVersion: this.schemaVersion,
      validationOptions: {
        knownRuntimeIds,
      },
    });

    if (result.success && result.runtime) {
      if (previous) {
        this.runtimeIds.delete(previous.id);
      }
      this.latest = result.runtime;
      this.runtimeIds.add(result.runtime.id);
    }

    return result;
  }

  getRuntimeEnvironment(): RuntimeEnvironment | null {
    return this.latest;
  }

  getCapabilities(): Capabilities | null {
    return this.getRuntimeEnvironment()?.capabilities ?? null;
  }

  getPlatformInfo(): PlatformInfo | null {
    return this.getRuntimeEnvironment()?.platform ?? null;
  }

  getApplicationInfo(): ApplicationInfo | null {
    return this.getRuntimeEnvironment()?.application ?? null;
  }

  getConnectivityInfo(): ConnectivityInfo | null {
    return this.getRuntimeEnvironment()?.connectivity ?? null;
  }

  validate() {
    return validateRuntimeEnvironment(this.getRuntimeEnvironment());
  }
}

export function createRuntimeEnvironmentService(
  deps: RuntimeEnvironmentServiceDeps = {},
): RuntimeEnvironmentService {
  return new RuntimeEnvironmentService(deps);
}
