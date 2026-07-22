/**
 * Deterministic conversation orchestration stage.
 * Pipeline position metadata — not prompt/AI execution.
 */
export const ConversationStages = {
  INTAKE: "intake",
  CONTEXT_READY: "context_ready",
  REQUEST_READY: "request_ready",
  HANDOFF: "handoff",
} as const;

export type ConversationStage =
  (typeof ConversationStages)[keyof typeof ConversationStages];

export const ALL_CONVERSATION_STAGES: readonly ConversationStage[] =
  Object.freeze([
    ConversationStages.INTAKE,
    ConversationStages.CONTEXT_READY,
    ConversationStages.REQUEST_READY,
    ConversationStages.HANDOFF,
  ]);
