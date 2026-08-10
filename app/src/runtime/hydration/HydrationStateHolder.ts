import {
  createHydrationState,
  createIdleHydrationState,
  type HydrationState,
} from "./HydrationState";

let currentState: HydrationState = createIdleHydrationState();

export function getHydrationStateHolder(): HydrationState {
  return currentState;
}

export function setHydrationStateHolder(state: HydrationState): void {
  currentState = state;
}

export function resetHydrationStateHolder(): void {
  currentState = createIdleHydrationState();
}
