import type { DomainEventSystem } from "../../../core/domain-events";
import type { WorkoutSession } from "../../workout-assembly/models/WorkoutSession";
import type { CompleteSetInput } from "../models/CompleteSetInput";
import type { WorkoutProgress } from "../models/WorkoutProgress";
import type { WorkoutResult } from "../models/WorkoutResult";
import type { WorkoutRuntimeConfiguration } from "../models/WorkoutRuntimeConfiguration";
import type { WorkoutRuntimeSummary } from "../models/WorkoutRuntimeSummary";
import type { WorkoutState } from "../models/WorkoutState";
import { WorkoutRuntimeEngine } from "../runtime/WorkoutRuntimeEngine";

const engines = new WeakMap<ActiveWorkout, WorkoutRuntimeEngine>();

/**
 * Opaque active-workout handle.
 * Application consumers never touch the internal engine or WorkoutRuntime.
 */
export class ActiveWorkout {
  /** @internal — only constructed by WorkoutRuntimeService. */
  constructor(engine: WorkoutRuntimeEngine) {
    engines.set(this, engine);
  }

  getSummary(): WorkoutRuntimeSummary {
    return resolveEngine(this).getSummary();
  }

  getProgress(): WorkoutProgress {
    return resolveEngine(this).getSnapshot().progress;
  }

  getState(): WorkoutState {
    return resolveEngine(this).getState();
  }

  isTerminal(): boolean {
    return resolveEngine(this).isTerminal();
  }

  /** Domain event system for this workout (Sprint 18.2). */
  getDomainEventSystem(): DomainEventSystem {
    return resolveEngine(this).getDomainEventSystem();
  }
}

function resolveEngine(workout: ActiveWorkout): WorkoutRuntimeEngine {
  const engine = engines.get(workout);
  if (!engine) {
    throw new Error("Invalid ActiveWorkout handle");
  }
  return engine;
}

/**
 * Service facade over WorkoutRuntimeEngine.
 */
export class WorkoutRuntimeService {
  start(
    session: WorkoutSession,
    configuration: Partial<WorkoutRuntimeConfiguration> = {},
    domainEventSystem?: DomainEventSystem,
  ): ActiveWorkout {
    const engine = new WorkoutRuntimeEngine(
      undefined,
      undefined,
      undefined,
      domainEventSystem,
    );
    engine.start(session, configuration);
    return new ActiveWorkout(engine);
  }

  pause(workout: ActiveWorkout): WorkoutRuntimeSummary {
    return resolveEngine(workout).pause();
  }

  resume(workout: ActiveWorkout): WorkoutRuntimeSummary {
    return resolveEngine(workout).resume();
  }

  complete(workout: ActiveWorkout): WorkoutResult {
    return resolveEngine(workout).complete();
  }

  cancel(workout: ActiveWorkout): WorkoutResult {
    return resolveEngine(workout).cancel();
  }

  skipExercise(workout: ActiveWorkout): WorkoutRuntimeSummary {
    return resolveEngine(workout).skipExercise();
  }

  completeSet(
    workout: ActiveWorkout,
    input: CompleteSetInput = {},
  ): WorkoutRuntimeSummary {
    return resolveEngine(workout).completeSet(input);
  }

  getSummary(workout: ActiveWorkout): WorkoutRuntimeSummary {
    return workout.getSummary();
  }
}

export function createWorkoutRuntimeService(): WorkoutRuntimeService {
  return new WorkoutRuntimeService();
}
