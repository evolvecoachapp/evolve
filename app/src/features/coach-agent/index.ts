/**
 * Coach Agent (Meta-Agent)
 *
 * Sprint 21.3 — Coach Agent Foundation.
 *
 * Agent Runtime → Coach Agent → Agent Coordinator →
 * Workout / Recovery / Nutrition Agents → Merge Results → CoachDecisionResult
 *
 * Orchestrates existing specialized agents only. Does not generate prompts,
 * call providers, or contain business logic. No networking. No persistence.
 * No memory. No UI.
 */

export * from "./models";
export {
  processCoachRequest,
  buildCoachingPlan,
  evaluateCoachDecision,
  describeCoachCapabilities,
  validateCoachPlan,
} from "./application";
export * from "./builders";
export * from "./validators";
export * from "./utils";
export * from "./selectors";
export * from "./mergers";
export * from "./evaluators";
export * from "./coordinator";
export {
  CoachFrameworkAgent,
  createCoachFrameworkAgent,
  COACH_FRAMEWORK_CAPABILITY_KEYS,
} from "./framework";
export { createCoachAgentService, CoachAgentService } from "./services";
