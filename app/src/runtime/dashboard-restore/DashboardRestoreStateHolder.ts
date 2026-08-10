import {
  createDashboardRestoreState,
  createIdleDashboardRestoreState,
  type DashboardRestoreState,
} from "./DashboardRestoreState";

let currentState: DashboardRestoreState = createIdleDashboardRestoreState();

export function getDashboardRestoreStateHolder(): DashboardRestoreState {
  return currentState;
}

export function setDashboardRestoreStateHolder(
  state: DashboardRestoreState,
): void {
  currentState = state;
}

export function resetDashboardRestoreStateHolder(): void {
  currentState = createIdleDashboardRestoreState();
}
