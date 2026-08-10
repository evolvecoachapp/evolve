import {
  createIdleRuntimeSessionState,
  type RuntimeSessionState,
} from "./RuntimeSessionState";

let currentState: RuntimeSessionState = createIdleRuntimeSessionState();

export function getRuntimeSessionStateHolder(): RuntimeSessionState {
  return currentState;
}

export function setRuntimeSessionStateHolder(
  state: RuntimeSessionState,
): void {
  currentState = state;
}

export function resetRuntimeSessionStateHolder(): void {
  currentState = createIdleRuntimeSessionState();
}
