import {
  DomainEventBuilder,
  EventContextBuilder,
  type DomainEventSystem,
  type EventContext,
} from "../../../core/domain-events";
import type { RestRuntime } from "../models/RestRuntime";

/**
 * Emits domain events for rest lifecycle actions.
 * Does not alter rest business logic — emission only.
 */
export class RestDomainEventEmitter {
  private readonly builder = new DomainEventBuilder();

  constructor(private readonly system: DomainEventSystem) {}

  getSystem(): DomainEventSystem {
    return this.system;
  }

  private context(runtime: RestRuntime): EventContext {
    return new EventContextBuilder()
      .from({
        sessionId: runtime.session.id,
        workoutRuntimeId: runtime.session.workoutRuntimeId,
        restRuntimeId: runtime.id,
      })
      .build();
  }

  private payload(runtime: RestRuntime, elapsedMs: number) {
    return {
      restRuntimeId: runtime.id,
      sessionId: runtime.session.id,
      workoutRuntimeId: runtime.session.workoutRuntimeId,
      elapsedMs,
      targetDurationMs: runtime.configuration.targetDurationMs,
      state: runtime.state,
    };
  }

  emitRestStarted(
    runtime: RestRuntime,
    elapsedMs: number,
    timestamp: string,
  ): void {
    this.system.publishEvent(
      this.builder.restLifecycle("rest_started", {
        sequence: this.system.nextSequence(),
        timestamp,
        context: this.context(runtime),
        payload: this.payload(runtime, elapsedMs),
        message: "Rest started",
      }),
    );
  }

  emitRestPaused(
    runtime: RestRuntime,
    elapsedMs: number,
    timestamp: string,
  ): void {
    this.system.publishEvent(
      this.builder.restLifecycle("rest_paused", {
        sequence: this.system.nextSequence(),
        timestamp,
        context: this.context(runtime),
        payload: this.payload(runtime, elapsedMs),
        message: "Rest paused",
      }),
    );
  }

  emitRestResumed(
    runtime: RestRuntime,
    elapsedMs: number,
    timestamp: string,
  ): void {
    this.system.publishEvent(
      this.builder.restLifecycle("rest_resumed", {
        sequence: this.system.nextSequence(),
        timestamp,
        context: this.context(runtime),
        payload: this.payload(runtime, elapsedMs),
        message: "Rest resumed",
      }),
    );
  }

  emitRestCompleted(
    runtime: RestRuntime,
    elapsedMs: number,
    timestamp: string,
  ): void {
    this.system.publishEvent(
      this.builder.restLifecycle("rest_completed", {
        sequence: this.system.nextSequence(),
        timestamp,
        context: this.context(runtime),
        payload: this.payload(runtime, elapsedMs),
        message: "Rest completed",
      }),
    );
  }

  emitRestCancelled(
    runtime: RestRuntime,
    elapsedMs: number,
    timestamp: string,
  ): void {
    this.system.publishEvent(
      this.builder.restLifecycle("rest_cancelled", {
        sequence: this.system.nextSequence(),
        timestamp,
        context: this.context(runtime),
        payload: this.payload(runtime, elapsedMs),
        message: "Rest cancelled",
      }),
    );
  }
}
