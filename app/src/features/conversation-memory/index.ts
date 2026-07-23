/**
 * Conversation Memory Foundation
 *
 * Sprint 21.4 — Conversation Memory Foundation.
 *
 * Coach Agent → Conversation Memory →
 * Profile / Context / Decision Memory → Memory Snapshot → Memory Result
 *
 * Stores structured coaching knowledge. Not chat history.
 * No AI. No prompts. No persistence implementation.
 * Contracts and orchestration only.
 */

export * from "./models";
export {
  saveMemory,
  loadMemory,
  queryMemory,
  updateMemory,
  buildMemorySnapshot,
  summarizeMemory,
} from "./application";
export * from "./builders";
export * from "./validators";
export * from "./utils";
export * from "./queries";
export * from "./policies";
export * from "./stores";
export * from "./timeline";
export {
  ConversationMemory,
  createConversationMemory,
} from "./memory";
export {
  ConversationMemoryService,
  createConversationMemoryService,
} from "./services";
