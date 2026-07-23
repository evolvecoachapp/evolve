import type { ToolDescriptor } from "../models/ToolDescriptor";
import type { ITool } from "./ITool";

/**
 * Optional provider of tool definitions for registry seeding.
 *
 * Not an AI vendor provider — no OpenAI / Anthropic / Gemini logic.
 */
export interface IToolProvider {
  listTools(): readonly ITool[];
  describeTool(toolId: string): ToolDescriptor | null;
}
