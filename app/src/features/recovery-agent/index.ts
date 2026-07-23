/**
 * Recovery Agent
 *
 * Sprint 21.3 — Recovery Agent Foundation.
 *
 * User Request → Conversation Runtime → Recovery Agent → Coach Intelligence
 *   → Prompt Builder → AI Provider → Response Formatter → Action Engine
 *   → Tool Runtime → Recovery Domain
 *
 * Orchestrates existing components. Does not generate prompts, call providers,
 * or execute tools. No networking. No persistence. No UI.
 */

export * from "./models";
export {
  processRecoveryRequest,
  buildRecoveryPlan,
  evaluateRecovery,
  describeRecoveryCapabilities,
  validateRecoveryPlan,
} from "./application";
export * from "./builders";
export * from "./validators";
export * from "./utils";
export {
  RecoveryFrameworkAgent,
  createRecoveryFrameworkAgent,
  RECOVERY_FRAMEWORK_CAPABILITY_KEYS,
} from "./framework";
