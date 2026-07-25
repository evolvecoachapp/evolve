import type { GoalPackage } from "../models/GoalPackage";
import type { GoalProgressState } from "../models/GoalProgressState";
import { GoalSessionStatuses } from "../models/GoalProgressState";
import { freezeState } from "../utils/FreezeGoalProgress";

export class GoalProgressSession {
  private state: GoalProgressState;

  constructor(updatedAt: string) {
    this.state = freezeState({
      status: GoalSessionStatuses.IDLE,
      package: null,
      decisions: Object.freeze([]),
      updatedAt,
    });
  }

  getState(): GoalProgressState {
    return this.state;
  }

  getPackage(): GoalPackage | null {
    return this.state.package;
  }

  put(pkg: GoalPackage, status: (typeof GoalSessionStatuses)[keyof typeof GoalSessionStatuses]): void {
    this.state = freezeState({
      status,
      package: pkg,
      decisions: pkg.decisions,
      updatedAt: pkg.createdAt,
    });
  }
}

export function createGoalProgressSession(updatedAt: string): GoalProgressSession {
  return new GoalProgressSession(updatedAt);
}
