import {
  createIdleRuntimeWriteThroughState,
  createRuntimeWriteThroughState,
  type RuntimeWriteThroughState,
} from "./RuntimeWriteThroughState";

let currentState: RuntimeWriteThroughState = createIdleRuntimeWriteThroughState();

export function getRuntimeWriteThroughStateHolder(): RuntimeWriteThroughState {
  return currentState;
}

export function setRuntimeWriteThroughStateHolder(
  state: RuntimeWriteThroughState,
): void {
  currentState = state;
}

export function resetRuntimeWriteThroughStateHolder(): void {
  currentState = createIdleRuntimeWriteThroughState();
}
