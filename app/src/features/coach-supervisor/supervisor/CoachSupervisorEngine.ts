import type { CollaborationPort } from "../contracts/CollaborationPort";
import type { RoutingPort } from "../contracts/RoutingPort";
import {
  CoachSupervisorCapabilityKinds,
  type CoachSupervisor,
} from "../models/CoachSupervisor";
import type { AgentExecutionSummary } from "../models/AgentExecutionSummary";
import { EMPTY_SUPERVISOR_METADATA } from "../models/CoachSupervisorMetadata";
import type { CoachSupervisorPlan } from "../models/CoachSupervisorPlan";
import type { CoachSupervisorRequest } from "../models/CoachSupervisorRequest";
import type { CoachSupervisorResult } from "../models/CoachSupervisorResult";
import type { CoachSupervisorValidation } from "../models/CoachSupervisorValidation";
import { freezeSupervisor } from "../utils/FreezeSupervisorState";
import { validateSupervisorPlan } from "../validators/validateSupervisorPlan";
import {
  createCoachCoordinator,
  type CoachCoordinator,
} from "./CoachCoordinator";

export interface CoachSupervisorEngineDeps {
  readonly routingPort: RoutingPort;
  readonly collaborationPort: CollaborationPort;
  readonly clock?: () => string;
  readonly supervisorId?: string;
}

/**
 * Coach Supervisor Engine — orchestration only.
 */
export class CoachSupervisorEngine {
  private readonly coordinator: CoachCoordinator;
  private readonly clock: () => string;
  private readonly supervisorId: string;

  constructor(deps: CoachSupervisorEngineDeps) {
    this.clock = deps.clock ?? (() => new Date().toISOString());
    this.supervisorId = deps.supervisorId ?? "agent:coach-supervisor";
    this.coordinator = createCoachCoordinator({
      routingPort: deps.routingPort,
      collaborationPort: deps.collaborationPort,
      clock: this.clock,
    });
  }

  describe(): CoachSupervisor {
    return freezeSupervisor({
      id: this.supervisorId,
      name: "Coach Supervisor",
      version: "1.0.0",
      role: "coach_supervisor",
      capabilities: Object.freeze([
        CoachSupervisorCapabilityKinds.ORCHESTRATE,
        CoachSupervisorCapabilityKinds.ROUTE,
        CoachSupervisorCapabilityKinds.COORDINATE,
        CoachSupervisorCapabilityKinds.AGGREGATE,
        CoachSupervisorCapabilityKinds.RESPOND,
      ]),
      supportedDomains: Object.freeze([
        "workout",
        "nutrition",
        "recovery",
        "goal",
      ]),
      metadata: EMPTY_SUPERVISOR_METADATA,
      createdAt: this.clock(),
    });
  }

  processRequest(request: CoachSupervisorRequest): CoachSupervisorResult {
    return this.coordinator.processCoachRequest(request);
  }

  buildPlan(request: CoachSupervisorRequest): CoachSupervisorResult {
    return this.coordinator.buildCoordinationPlan(request);
  }

  aggregate(input: {
    readonly plan: CoachSupervisorPlan;
    readonly summaries: readonly AgentExecutionSummary[];
  }): CoachSupervisorResult {
    return this.coordinator.aggregateResults(input);
  }

  validatePlan(plan: CoachSupervisorPlan): CoachSupervisorValidation {
    return validateSupervisorPlan(plan);
  }

  getCoordinator(): CoachCoordinator {
    return this.coordinator;
  }
}

export function createCoachSupervisorEngine(
  deps: CoachSupervisorEngineDeps,
): CoachSupervisorEngine {
  return new CoachSupervisorEngine(deps);
}
