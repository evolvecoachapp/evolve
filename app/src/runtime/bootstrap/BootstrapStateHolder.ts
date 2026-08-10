import {
  createBootstrapState,
  createIdleBootstrapState,
  type BootstrapState,
} from "./BootstrapState";

let currentState: BootstrapState = createIdleBootstrapState();

export function getBootstrapStateHolder(): BootstrapState {
  return currentState;
}

export function setBootstrapStateHolder(state: BootstrapState): void {
  currentState = state;
}

export function resetBootstrapStateHolder(): void {
  currentState = createIdleBootstrapState();
}
