/**
 * Response Formatter
 *
 * Sprint 19.4 — Response Formatter.
 *
 * AIResponse → Response Formatter → CoachResponse → UI / Action Engine
 *
 * Transforms an immutable AIResponse into an immutable CoachResponse.
 * Completely provider-independent. No networking. No SDKs. No prompt generation.
 * No conversation orchestration. No business logic. No persistence.
 * Only deterministic response transformation.
 */

export * from "./models";
export {
  formatResponse,
  buildCoachResponse,
  summarizeResponse,
  validateResponse,
} from "./application";
export * from "./builders";
export * from "./validators";
export * from "./utils";
