/**
 * Domain Tool Adapters
 *
 * Sprint 20.2 — Domain Tool Adapters.
 *
 * Tool Calling Engine → Domain Tool Adapters → Existing Domain →
 * Foundation Tool Result
 *
 * Adapters translate ToolCallRequest ↔ domain application APIs.
 * No business logic. No provider logic. Domain remains the source of truth.
 */

export * from "./models";
export * from "./contracts";
export * from "./application";
export * from "./builders";
export * from "./validators";
export * from "./mappers";
export * from "./adapters";
export * from "./services";
export * from "./utils";
