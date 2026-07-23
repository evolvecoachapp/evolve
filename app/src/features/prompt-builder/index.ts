/**
 * Prompt Builder
 *
 * Sprint 19.1 — Prompt Builder Foundation.
 *
 * Conversation Context → Prompt Builder → Prompt Package
 * → Future AI Provider
 *
 * No AI providers. No networking. No HTTP. No OpenAI / Anthropic / Gemini.
 * No prompt execution. No persistence. Immutable prompt composition only.
 *
 * Legacy coach-backed PromptContext path (hooks / repository / getCoachPrompt)
 * remains available alongside the ConversationContext → PromptPackage API.
 */

export * from "./models";
export * from "./application";
export * from "./builders";
export * from "./blocks";
export * from "./composers";
export * from "./templates";
export * from "./selectors";
export * from "./validators";
export * from "./utils";
export * from "./hooks";
export * from "./repository";
