/**
 * Shared constants for the workout-generation integration framework.
 * Deterministic values only — no networking, persistence, or clocks.
 */

export const INTEGRATION_FIXED_TIMESTAMP = "2026-07-22T12:00:00.000Z";

export const INTEGRATION_FRAMEWORK_VERSION = "17.8.0";

/** Placeholder tokens used when normalizing non-deterministic / id-like fields. */
export const SNAPSHOT_PLACEHOLDERS = Object.freeze({
  generationId: "<GENERATION_ID>",
  requestId: "<REQUEST_ID>",
  sessionId: "<SESSION_ID>",
  blueprintId: "<BLUEPRINT_ID>",
  athleteId: "<ATHLETE_ID>",
  conversationId: "<CONVERSATION_ID>",
  timestamp: "<TIMESTAMP>",
  exerciseInstanceId: "<EXERCISE_INSTANCE_ID>",
} as const);
