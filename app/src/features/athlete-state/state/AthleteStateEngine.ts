import { buildAthleteStateDescriptor } from "../builders/AthleteStateBuilder";
import type { AthleteStateDescriptor } from "../models/AthleteStateDescriptor";
import type { AthleteStateRequest } from "../models/AthleteStateRequest";
import type { AthleteStateResult } from "../models/AthleteStateResult";
import {
  createAthleteStateCoordinator,
  type AthleteStateCoordinator,
  type AthleteStateCoordinatorDeps,
} from "./AthleteStateCoordinator";

export type AthleteStateEngineDeps = AthleteStateCoordinatorDeps;

/**
 * Athlete State Engine — immutable state orchestration only.
 */
export class AthleteStateEngine {
  private readonly coordinator: AthleteStateCoordinator;
  private readonly clock: () => string;
  private readonly runtimeId: string;

  constructor(deps: AthleteStateEngineDeps = {}) {
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.runtimeId = deps.runtimeId ?? "runtime:athlete-state";
    this.coordinator = createAthleteStateCoordinator({
      ...deps,
      clock: this.clock,
      runtimeId: this.runtimeId,
    });
  }

  describe(): AthleteStateDescriptor {
    return buildAthleteStateDescriptor({
      id: this.runtimeId,
      createdAt: this.clock(),
    });
  }

  buildAthleteState(request: AthleteStateRequest): AthleteStateResult {
    return this.coordinator.build(request);
  }

  updateAthleteState(request: AthleteStateRequest): AthleteStateResult {
    return this.coordinator.update(request);
  }

  createSnapshot(request: AthleteStateRequest): AthleteStateResult {
    return this.coordinator.snapshot(request);
  }

  describeAthleteState(): AthleteStateResult {
    return this.coordinator.describe();
  }

  validateAthleteState(request: AthleteStateRequest): AthleteStateResult {
    return this.coordinator.validate(request);
  }

  getCoordinator(): AthleteStateCoordinator {
    return this.coordinator;
  }
}

export function createAthleteStateEngine(
  deps: AthleteStateEngineDeps = {},
): AthleteStateEngine {
  return new AthleteStateEngine(deps);
}
