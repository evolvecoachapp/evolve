import type { WorkoutAdaptation } from "../models/WorkoutAdaptation";
import type { WorkoutAdaptationState } from "../models/WorkoutAdaptationState";
import { WorkoutSessionStatuses } from "../models/WorkoutAdaptationState";
import type { WorkoutPackage } from "../models/WorkoutPackage";
import { freezeState } from "../utils/FreezeWorkoutAdaptation";

export class WorkoutAdaptationSession {
  private state: WorkoutAdaptationState;

  constructor(updatedAt: string) {
    this.state = freezeState({
      status: WorkoutSessionStatuses.IDLE,
      package: null,
      adaptation: null,
      updatedAt,
    });
  }

  getState(): WorkoutAdaptationState {
    return this.state;
  }

  getPackage(): WorkoutPackage | null {
    return this.state.package;
  }

  getAdaptation(): WorkoutAdaptation | null {
    return this.state.adaptation;
  }

  put(
    pkg: WorkoutPackage,
    status: (typeof WorkoutSessionStatuses)[keyof typeof WorkoutSessionStatuses],
  ): void {
    this.state = freezeState({
      status,
      package: pkg,
      adaptation: pkg.adaptation,
      updatedAt: pkg.createdAt,
    });
  }
}

export function createWorkoutAdaptationSession(updatedAt: string): WorkoutAdaptationSession {
  return new WorkoutAdaptationSession(updatedAt);
}
