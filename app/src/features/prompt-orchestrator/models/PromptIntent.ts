/**
 * Rule-based prompt intent classification.
 *
 * Unknown is a valid outcome — never inferred via AI.
 */
export const PROMPT_INTENTS = Object.freeze([
  "GENERAL_CHAT",
  "WORKOUT",
  "PROGRAM",
  "NUTRITION",
  "RECOVERY",
  "TECHNIQUE",
  "GOAL",
  "PROGRESS",
  "UNKNOWN",
] as const);

export type PromptIntent = (typeof PROMPT_INTENTS)[number];
