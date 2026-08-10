import {
  createIdleRuntimeObserverState,
  type RuntimeObserverState,
} from "./RuntimeObserverState";

let currentState: RuntimeObserverState = createIdleRuntimeObserverState();

export function getRuntimeObserverStateHolder(): RuntimeObserverState {
  return currentState;
}

export function setRuntimeObserverStateHolder(
  state: RuntimeObserverState,
): void {
  currentState = state;
}

export function resetRuntimeObserverStateHolder(): void {
  currentState = createIdleRuntimeObserverState();
}
