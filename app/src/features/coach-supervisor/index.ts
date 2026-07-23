/**
 * Coach Supervisor Foundation
 *
 * Sprint 21.8 — Coach Supervisor Foundation.
 *
 * User Request
 *      ↓
 * Coach Supervisor
 *      ↓
 * Routing Engine
 *      ↓
 * Capability Registry
 *      ↓
 * Agent Collaboration
 *      ↓
 * Specialist Agents
 *      ↓
 * Aggregation
 *      ↓
 * Unified Coach Response
 *
 * Central orchestrator of EVOLVE multi-agent workflow.
 * Never performs workout / nutrition / recovery / goal / business logic.
 *
 * No AI. No prompts. No networking. No persistence. No UI.
 */

export * from "./models";
export {
  processCoachRequest,
  buildCoordinationPlan,
  aggregateResults,
  describeSupervisorCapabilities,
  validateSupervisorPlan,
} from "./application";
export {
  CoachSupervisorService,
  createCoachSupervisorService,
} from "./services";
