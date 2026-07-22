import {
  createDomainEventSystem,
  type DomainEventSystem,
} from "../../../core/domain-events";
import { RestRuntimeBuilder } from "../builders/RestRuntimeBuilder";
import { RestDomainEventEmitter } from "../integration/RestDomainEventEmitter";
import type { RestConfiguration } from "../models/RestConfiguration";
import type {
  RestEvent,
  RestEventType,
} from "../models/RestEvent";
import type { RestResult } from "../models/RestResult";
import type { RestRuntime } from "../models/RestRuntime";
import { RestRuntimeError } from "../models/RestRuntimeError";
import type { RestSession } from "../models/RestSession";
import type { RestState } from "../models/RestState";
import type { RestSummary } from "../models/RestSummary";
import {
  buildSummary,
  freezeResult,
  freezeRuntime,
  freezeSummary,
  validateSessionForRuntime,
} from "../utils";
import {
  canTransitionRestState,
  shouldAutoExpire,
  validateElapsedUpdate,
  validateElapsedUpdateOperation,
  validateRestCompletion,
  validateRestExpiration,
  validateSessionDurations,
} from "../validators";

const DEFAULT_TIMESTAMP = "2026-07-22T00:00:00.000Z";

/**
 * In-memory rest runtime engine.
 *
 * Elapsed time is injected — never calls setTimeout / setInterval.
 * No UI. No persistence. No networking. No platform timers.
 * Emits domain events for lifecycle actions (Sprint 18.2).
 */
export class RestRuntimeEngine {
  private runtime: RestRuntime | null = null;
  private pauseCount = 0;
  private updateCount = 0;
  private eventSequence = 0;
  private elapsedMs = 0;
  private readonly domainEvents: DomainEventSystem;
  private readonly domainEmitter: RestDomainEventEmitter;

  constructor(
    private readonly runtimeBuilder: RestRuntimeBuilder = new RestRuntimeBuilder(),
    domainEventSystem?: DomainEventSystem,
  ) {
    this.domainEvents =
      domainEventSystem ??
      createDomainEventSystem({ sessionId: "rest-runtime" });
    this.domainEmitter = new RestDomainEventEmitter(this.domainEvents);
  }

  /**
   * Domain event system used for this runtime instance (Sprint 18.2).
   */
  getDomainEventSystem(): DomainEventSystem {
    return this.domainEvents;
  }

  /**
   * Seed runtime from session and transition Idle → Running.
   */
  start(
    session: RestSession,
    configuration: Partial<RestConfiguration> = {},
  ): RestSummary {
    if (this.runtime !== null && this.runtime.state !== "Idle") {
      throw new RestRuntimeError(
        "already_started",
        `Cannot start rest in state ${this.runtime.state}`,
      );
    }

    const sessionIssues = validateSessionForRuntime(session);
    if (sessionIssues.length > 0) {
      throw new RestRuntimeError("invalid_session", sessionIssues.join("; "));
    }

    const seeded = this.runtimeBuilder.build({
      session,
      configuration,
      state: "Idle",
    });

    const configIssues = validateSessionDurations(
      session,
      seeded.configuration,
    );
    if (configIssues.length > 0) {
      throw new RestRuntimeError(
        "invalid_configuration",
        configIssues.join("; "),
      );
    }

    const timestamp = this.timestamp(seeded.configuration);
    this.pauseCount = 0;
    this.updateCount = 0;
    this.eventSequence = 0;
    this.elapsedMs = 0;

    this.runtime = this.withState(seeded, "Running", {
      startedAt: timestamp,
      eventType: "rest_started",
      message: "Rest started",
      timestamp,
    });

    this.domainEmitter.emitRestStarted(
      this.runtime,
      this.elapsedMs,
      timestamp,
    );

    return this.summary();
  }

  pause(): RestSummary {
    const runtime = this.requireRuntime();
    this.assertTransition(runtime.state, "Paused");
    const timestamp = this.timestamp(runtime.configuration);
    this.pauseCount += 1;
    this.runtime = this.withState(runtime, "Paused", {
      pausedAt: timestamp,
      eventType: "rest_paused",
      message: "Rest paused",
      timestamp,
    });
    this.domainEmitter.emitRestPaused(
      this.runtime,
      this.elapsedMs,
      timestamp,
    );
    return this.summary();
  }

  resume(): RestSummary {
    const runtime = this.requireRuntime();
    this.assertTransition(runtime.state, "Running");
    const timestamp = this.timestamp(runtime.configuration);
    this.runtime = this.withState(runtime, "Running", {
      pausedAt: null,
      eventType: "rest_resumed",
      message: "Rest resumed",
      timestamp,
    });
    this.domainEmitter.emitRestResumed(
      this.runtime,
      this.elapsedMs,
      timestamp,
    );
    return this.summary();
  }

  complete(): RestResult {
    const runtime = this.requireRuntime();
    this.assertTransition(runtime.state, "Completed");
    this.assertIssues(validateRestCompletion(runtime));

    const timestamp = this.timestamp(runtime.configuration);
    this.runtime = this.withState(runtime, "Completed", {
      completedAt: timestamp,
      eventType: "rest_completed",
      message: "Rest completed",
      timestamp,
    });

    this.domainEmitter.emitRestCompleted(
      this.runtime,
      this.elapsedMs,
      timestamp,
    );
    return freezeResult(this.runtime, timestamp);
  }

  cancel(): RestResult {
    const runtime = this.requireRuntime();
    this.assertTransition(runtime.state, "Cancelled");
    const timestamp = this.timestamp(runtime.configuration);
    this.runtime = this.withState(runtime, "Cancelled", {
      cancelledAt: timestamp,
      eventType: "rest_cancelled",
      message: "Rest cancelled",
      timestamp,
    });
    this.domainEmitter.emitRestCancelled(
      this.runtime,
      this.elapsedMs,
      timestamp,
    );
    return freezeResult(this.runtime, timestamp);
  }

  /**
   * Inject elapsed active rest duration from the outside.
   * May auto-expire when configuration.autoExpireOnTarget is true.
   */
  updateElapsedTime(elapsedMs: number): RestSummary {
    const runtime = this.requireRuntime();
    this.assertIssues(validateElapsedUpdateOperation(runtime));
    this.assertIssues(validateElapsedUpdate(this.elapsedMs, elapsedMs));

    this.elapsedMs = Math.floor(elapsedMs);
    this.updateCount += 1;

    const timestamp = this.timestamp(runtime.configuration);

    if (shouldAutoExpire(runtime, this.elapsedMs)) {
      this.runtime = this.withState(runtime, "Expired", {
        expiredAt: timestamp,
        eventType: "rest_expired",
        message: "Rest expired at target",
        timestamp,
      });
      // Expired maps to rest_completed domain event (terminal success path).
      this.domainEmitter.emitRestCompleted(
        this.runtime,
        this.elapsedMs,
        timestamp,
      );
      return this.summary();
    }

    this.runtime = this.rebuild(runtime, {
      events: [
        ...runtime.events,
        this.createEvent({
          type: "elapsed_updated",
          state: runtime.state,
          elapsedMs: this.elapsedMs,
          message: `Elapsed updated to ${this.elapsedMs}ms`,
          occurredAt: timestamp,
        }),
      ],
    });

    return this.summary();
  }

  /**
   * Explicitly expire rest when target has been reached.
   */
  expire(): RestResult {
    const runtime = this.requireRuntime();
    this.assertTransition(runtime.state, "Expired");
    this.assertIssues(validateRestExpiration(runtime));

    const timestamp = this.timestamp(runtime.configuration);
    this.runtime = this.withState(runtime, "Expired", {
      expiredAt: timestamp,
      eventType: "rest_expired",
      message: "Rest expired",
      timestamp,
    });

    this.domainEmitter.emitRestCompleted(
      this.runtime,
      this.elapsedMs,
      timestamp,
    );
    return freezeResult(this.runtime, timestamp);
  }

  getSummary(): RestSummary {
    return this.summary();
  }

  getSnapshot(): RestRuntime {
    return freezeRuntime(this.requireRuntime());
  }

  getState(): RestState {
    return this.requireRuntime().state;
  }

  getElapsedMs(): number {
    return this.elapsedMs;
  }

  isTerminal(): boolean {
    const state = this.runtime?.state;
    return (
      state === "Completed" || state === "Cancelled" || state === "Expired"
    );
  }

  private withState(
    runtime: RestRuntime,
    state: RestState,
    options: {
      readonly startedAt?: string | null;
      readonly pausedAt?: string | null;
      readonly completedAt?: string | null;
      readonly cancelledAt?: string | null;
      readonly expiredAt?: string | null;
      readonly eventType: RestEventType;
      readonly message: string;
      readonly timestamp: string;
    },
  ): RestRuntime {
    const events = [
      ...runtime.events,
      this.createEvent({
        type: options.eventType,
        state,
        elapsedMs: this.elapsedMs,
        message: options.message,
        occurredAt: options.timestamp,
      }),
    ];

    return this.rebuild(runtime, {
      state,
      startedAt:
        options.startedAt !== undefined ? options.startedAt : runtime.startedAt,
      pausedAt:
        options.pausedAt !== undefined ? options.pausedAt : runtime.pausedAt,
      completedAt:
        options.completedAt !== undefined
          ? options.completedAt
          : runtime.completedAt,
      cancelledAt:
        options.cancelledAt !== undefined
          ? options.cancelledAt
          : runtime.cancelledAt,
      expiredAt:
        options.expiredAt !== undefined
          ? options.expiredAt
          : runtime.expiredAt,
      events,
    });
  }

  private rebuild(
    runtime: RestRuntime,
    patch: {
      readonly state?: RestState;
      readonly events?: readonly RestEvent[];
      readonly startedAt?: string | null;
      readonly pausedAt?: string | null;
      readonly completedAt?: string | null;
      readonly cancelledAt?: string | null;
      readonly expiredAt?: string | null;
    },
  ): RestRuntime {
    return this.runtimeBuilder.fromParts({
      id: runtime.id,
      session: runtime.session,
      state: patch.state ?? runtime.state,
      configuration: runtime.configuration,
      events: patch.events ?? runtime.events,
      startedAt:
        patch.startedAt !== undefined ? patch.startedAt : runtime.startedAt,
      pausedAt:
        patch.pausedAt !== undefined ? patch.pausedAt : runtime.pausedAt,
      completedAt:
        patch.completedAt !== undefined
          ? patch.completedAt
          : runtime.completedAt,
      cancelledAt:
        patch.cancelledAt !== undefined
          ? patch.cancelledAt
          : runtime.cancelledAt,
      expiredAt:
        patch.expiredAt !== undefined ? patch.expiredAt : runtime.expiredAt,
      elapsedMs: this.elapsedMs,
      pauseCount: this.pauseCount,
      updateCount: this.updateCount,
    });
  }

  private createEvent(input: {
    readonly type: RestEventType;
    readonly state: RestState;
    readonly elapsedMs: number;
    readonly message: string;
    readonly occurredAt: string;
  }): RestEvent {
    this.eventSequence += 1;
    return Object.freeze({
      id: `rest-event:${this.eventSequence}`,
      type: input.type,
      sequence: this.eventSequence,
      state: input.state,
      elapsedMs: input.elapsedMs,
      message: input.message,
      occurredAt: input.occurredAt,
    });
  }

  private summary(): RestSummary {
    return freezeSummary(buildSummary(this.requireRuntime()));
  }

  private requireRuntime(): RestRuntime {
    if (!this.runtime) {
      throw new RestRuntimeError(
        "not_started",
        "Rest runtime has not been started",
      );
    }
    return this.runtime;
  }

  private assertTransition(from: RestState, to: RestState): void {
    if (!canTransitionRestState(from, to)) {
      throw new RestRuntimeError(
        "invalid_transition",
        `Cannot transition from ${from} to ${to}`,
      );
    }
  }

  private assertIssues(issues: readonly string[]): void {
    if (issues.length > 0) {
      throw new RestRuntimeError("invalid_operation", issues.join("; "));
    }
  }

  private timestamp(configuration: RestConfiguration): string {
    return configuration.fixedTimestamp ?? DEFAULT_TIMESTAMP;
  }
}
