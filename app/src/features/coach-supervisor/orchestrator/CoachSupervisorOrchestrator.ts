import type { CoachSupervisorRequest } from "../models/CoachSupervisorRequest";
import type { CoachSupervisorResult } from "../models/CoachSupervisorResult";
import type { CoachSupervisorEngine } from "../supervisor/CoachSupervisorEngine";

/**
 * Thin orchestrator over CoachSupervisorEngine.
 */
export class CoachSupervisorOrchestrator {
  constructor(private readonly engine: CoachSupervisorEngine) {}

  process(request: CoachSupervisorRequest): CoachSupervisorResult {
    return this.engine.processRequest(request);
  }
}

export function createCoachSupervisorOrchestrator(
  engine: CoachSupervisorEngine,
): CoachSupervisorOrchestrator {
  return new CoachSupervisorOrchestrator(engine);
}
