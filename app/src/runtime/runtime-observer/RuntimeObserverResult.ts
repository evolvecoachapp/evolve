import type {
  RuntimeObserverPhase,
  RuntimeObserverWatchedService,
} from "./RuntimeObserverInitialization";
import { RUNTIME_OBSERVER_WATCHED_SERVICES } from "./RuntimeObserverInitialization";

export interface RuntimeObserverResult {
  readonly status: "ready";
  readonly startedAt: string;
  readonly completedAt: string;
  readonly phases: readonly RuntimeObserverPhase[];
  readonly watchedServices: readonly RuntimeObserverWatchedService[];
}

export interface CreateRuntimeObserverResultInput {
  readonly startedAt: string;
  readonly completedAt: string;
  readonly phases: readonly RuntimeObserverPhase[];
  readonly watchedServices?: readonly RuntimeObserverWatchedService[];
}

export function createRuntimeObserverResult(
  input: CreateRuntimeObserverResultInput,
): RuntimeObserverResult {
  return Object.freeze({
    status: "ready",
    startedAt: input.startedAt,
    completedAt: input.completedAt,
    phases: Object.freeze([...input.phases]),
    watchedServices: Object.freeze([
      ...(input.watchedServices ?? RUNTIME_OBSERVER_WATCHED_SERVICES),
    ]),
  });
}
