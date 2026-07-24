import type { AthleteStateDescriptor } from "../models/AthleteStateDescriptor";
import type { AthleteStateRequest } from "../models/AthleteStateRequest";
import type { AthleteStateResult } from "../models/AthleteStateResult";
import {
  createAthleteStateEngine,
  type AthleteStateEngine,
  type AthleteStateEngineDeps,
} from "../state/AthleteStateEngine";

export type AthleteStateServiceDeps = AthleteStateEngineDeps;

/**
 * Athlete State Service — state orchestration facade.
 *
 * Specialist Agents → Athlete State Engine → Coach Supervisor Context
 *
 * No networking. No persistence. No provider SDKs. No AI. No calculations.
 */
export class AthleteStateService {
  private readonly engine: AthleteStateEngine;

  constructor(deps: AthleteStateServiceDeps = {}) {
    this.engine = createAthleteStateEngine(deps);
  }

  buildAthleteState(request: AthleteStateRequest): AthleteStateResult {
    return this.engine.buildAthleteState(request);
  }

  updateAthleteState(request: AthleteStateRequest): AthleteStateResult {
    return this.engine.updateAthleteState(request);
  }

  createSnapshot(request: AthleteStateRequest): AthleteStateResult {
    return this.engine.createSnapshot(request);
  }

  describeAthleteState(): AthleteStateDescriptor {
    return this.engine.describe();
  }

  validateAthleteState(request: AthleteStateRequest): AthleteStateResult {
    return this.engine.validateAthleteState(request);
  }
}

export function createAthleteStateService(
  deps: AthleteStateServiceDeps = {},
): AthleteStateService {
  return new AthleteStateService(deps);
}
