/**
 * Recovery Adaptation Engine
 *
 * Sprint 24.3 — Recovery Adaptation Engine Foundation.
 *
 * Recovery Plan + Recovery Runtime + Athlete State +
 * Continuous Adaptation Decision + Coach Context
 *   ↓
 * Recovery Adaptation Engine
 *   ↓
 * Updated Recovery Plan → Recovery Runtime
 *
 * Adapts an existing recovery plan according to adaptation decisions.
 * Does NOT generate recovery from scratch. Does NOT change athlete goals.
 *
 * No AI. No heuristics. No prediction. No persistence. No networking. No UI.
 * No OpenAI SDK. No Prompt Builder. No Tool Runtime. No Action Engine.
 * No business calculations that invent prescriptions.
 *
 * Public surface: models + application API + RecoveryAdaptationEngineService.
 * Internal layers (evaluation / planning / adapters / policies / etc.) are not exported.
 */

export * from "./models";
export {
  adaptRecovery,
  compareRecovery,
  describeRecoveryAdaptation,
  createRecoverySnapshot,
  validateRecoveryAdaptation,
} from "./application";
export {
  RecoveryAdaptationEngineService,
  createRecoveryAdaptationEngineService,
} from "./services";
