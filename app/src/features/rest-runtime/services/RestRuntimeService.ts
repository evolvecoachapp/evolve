import type { RestConfiguration } from "../models/RestConfiguration";
import type { RestProgress } from "../models/RestProgress";
import type { RestResult } from "../models/RestResult";
import type { RestSession } from "../models/RestSession";
import type { RestState } from "../models/RestState";
import type { RestSummary } from "../models/RestSummary";
import { RestRuntimeEngine } from "../runtime/RestRuntimeEngine";

const engines = new WeakMap<ActiveRest, RestRuntimeEngine>();

/**
 * Opaque active-rest handle.
 * Application consumers never touch the internal engine or RestRuntime.
 */
export class ActiveRest {
  /** @internal — only constructed by RestRuntimeService. */
  constructor(engine: RestRuntimeEngine) {
    engines.set(this, engine);
  }

  getSummary(): RestSummary {
    return resolveEngine(this).getSummary();
  }

  getProgress(): RestProgress {
    return resolveEngine(this).getSnapshot().progress;
  }

  getState(): RestState {
    return resolveEngine(this).getState();
  }

  getElapsedMs(): number {
    return resolveEngine(this).getElapsedMs();
  }

  isTerminal(): boolean {
    return resolveEngine(this).isTerminal();
  }
}

function resolveEngine(rest: ActiveRest): RestRuntimeEngine {
  const engine = engines.get(rest);
  if (!engine) {
    throw new Error("Invalid ActiveRest handle");
  }
  return engine;
}

/**
 * Service facade over RestRuntimeEngine.
 */
export class RestRuntimeService {
  start(
    session: RestSession,
    configuration: Partial<RestConfiguration> = {},
  ): ActiveRest {
    const engine = new RestRuntimeEngine();
    engine.start(session, configuration);
    return new ActiveRest(engine);
  }

  pause(rest: ActiveRest): RestSummary {
    return resolveEngine(rest).pause();
  }

  resume(rest: ActiveRest): RestSummary {
    return resolveEngine(rest).resume();
  }

  complete(rest: ActiveRest): RestResult {
    return resolveEngine(rest).complete();
  }

  cancel(rest: ActiveRest): RestResult {
    return resolveEngine(rest).cancel();
  }

  updateElapsedTime(rest: ActiveRest, elapsedMs: number): RestSummary {
    return resolveEngine(rest).updateElapsedTime(elapsedMs);
  }

  getSummary(rest: ActiveRest): RestSummary {
    return rest.getSummary();
  }
}

export function createRestRuntimeService(): RestRuntimeService {
  return new RestRuntimeService();
}
