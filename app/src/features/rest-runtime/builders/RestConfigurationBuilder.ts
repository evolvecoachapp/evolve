import type { RestConfiguration } from "../models/RestConfiguration";
import { DEFAULT_REST_CONFIGURATION } from "../models/RestConfiguration";

export interface BuildRestConfigurationInput {
  readonly targetDurationMs?: number;
  readonly allowOvertime?: boolean;
  readonly autoExpireOnTarget?: boolean;
  readonly fixedTimestamp?: string | null;
}

/**
 * Build an immutable RestConfiguration.
 */
export class RestConfigurationBuilder {
  build(
    input: BuildRestConfigurationInput = {},
  ): RestConfiguration {
    return Object.freeze({
      targetDurationMs:
        input.targetDurationMs ?? DEFAULT_REST_CONFIGURATION.targetDurationMs,
      allowOvertime:
        input.allowOvertime ?? DEFAULT_REST_CONFIGURATION.allowOvertime,
      autoExpireOnTarget:
        input.autoExpireOnTarget ??
        DEFAULT_REST_CONFIGURATION.autoExpireOnTarget,
      fixedTimestamp:
        input.fixedTimestamp !== undefined
          ? input.fixedTimestamp
          : DEFAULT_REST_CONFIGURATION.fixedTimestamp,
    });
  }

  fromTargetDuration(
    targetDurationMs: number,
    overrides: Omit<BuildRestConfigurationInput, "targetDurationMs"> = {},
  ): RestConfiguration {
    return this.build({ ...overrides, targetDurationMs });
  }
}
