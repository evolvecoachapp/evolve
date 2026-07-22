import type { RestConfiguration } from "../models/RestConfiguration";
import { DEFAULT_REST_CONFIGURATION } from "../models/RestConfiguration";
import type { RestEvent } from "../models/RestEvent";
import type { RestRuntime } from "../models/RestRuntime";
import type { RestSession } from "../models/RestSession";
import type { RestState } from "../models/RestState";
import {
  buildMetrics,
  calculateProgress,
  deriveRestStatus,
} from "../utils/calculateProgress";
import { RestConfigurationBuilder } from "./RestConfigurationBuilder";

export interface BuildRestRuntimeInput {
  readonly session: RestSession;
  readonly runtimeId?: string;
  readonly configuration?: Partial<RestConfiguration>;
  readonly state?: RestState;
}

/**
 * Build a RestRuntime from an immutable RestSession.
 */
export class RestRuntimeBuilder {
  constructor(
    private readonly configurationBuilder: RestConfigurationBuilder = new RestConfigurationBuilder(),
  ) {}

  build(input: BuildRestRuntimeInput): RestRuntime {
    const fromSession = this.configurationBuilder.build({
      targetDurationMs: input.session.target.duration.milliseconds,
      allowOvertime: input.session.target.allowOvertime,
      autoExpireOnTarget: input.session.target.expireOnTarget,
    });

    const configuration = Object.freeze({
      ...DEFAULT_REST_CONFIGURATION,
      ...fromSession,
      ...input.configuration,
      targetDurationMs:
        input.configuration?.targetDurationMs ??
        fromSession.targetDurationMs,
    });

    return this.fromParts({
      id: input.runtimeId ?? `rest-runtime:${input.session.id}`,
      session: input.session,
      state: input.state ?? "Idle",
      configuration,
      events: Object.freeze([]),
      startedAt: null,
      pausedAt: null,
      completedAt: null,
      cancelledAt: null,
      expiredAt: null,
      elapsedMs: 0,
      pauseCount: 0,
      updateCount: 0,
    });
  }

  fromParts(input: {
    readonly id: string;
    readonly session: RestSession;
    readonly state: RestState;
    readonly configuration: RestConfiguration;
    readonly events: readonly RestEvent[];
    readonly startedAt: string | null;
    readonly pausedAt: string | null;
    readonly completedAt: string | null;
    readonly cancelledAt: string | null;
    readonly expiredAt: string | null;
    readonly elapsedMs: number;
    readonly pauseCount: number;
    readonly updateCount: number;
  }): RestRuntime {
    const progress = calculateProgress(
      input.configuration.targetDurationMs,
      input.elapsedMs,
    );
    const status = deriveRestStatus(input.state, progress);
    const metrics = buildMetrics({
      targetDurationMs: input.configuration.targetDurationMs,
      elapsedMs: input.elapsedMs,
      pauseCount: input.pauseCount,
      eventCount: input.events.length,
      updateCount: input.updateCount,
    });

    return Object.freeze({
      id: input.id,
      sessionId: input.session.id,
      session: input.session,
      state: input.state,
      status,
      configuration: input.configuration,
      progress,
      metrics,
      events: Object.freeze([...input.events]),
      startedAt: input.startedAt,
      pausedAt: input.pausedAt,
      completedAt: input.completedAt,
      cancelledAt: input.cancelledAt,
      expiredAt: input.expiredAt,
    });
  }
}
