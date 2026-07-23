import type { AIToolCall } from "../models/AIToolCall";
import type { AIToolResult } from "../models/AIToolResult";
import type { IAIProvider } from "./IAIProvider";

/**
 * Tool-calling provider extension (contract only — no execution).
 */
export interface IToolCallingProvider extends IAIProvider {
  supportsTools(): boolean;
  /**
   * Future entrypoint — not invoked by AIProviderEngine.
   */
  prepareToolCalls?(calls: readonly AIToolCall[]): readonly AIToolCall[];
  /**
   * Future entrypoint — not invoked by AIProviderEngine.
   */
  acceptToolResults?(results: readonly AIToolResult[]): void;
}
