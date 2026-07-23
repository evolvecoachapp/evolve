import type { ToolCallRequest } from "../models/ToolCallRequest";
import type { ToolExecutionContext } from "../models/ToolExecutionContext";
import type { ToolExecutionResult } from "../models/ToolExecutionResult";
import type { ToolInput } from "../models/ToolInput";
import type { ToolSchema } from "../models/ToolSchema";
import type { IToolRegistry } from "./IToolRegistry";

/**
 * Validation surface for tool-calling foundation concerns.
 * Interfaces only — concrete validators live under validators/.
 */
export interface IToolValidator {
  validateToolId(toolId: string): readonly string[];
  validateParameters(
    input: ToolInput,
    schema: ToolSchema,
  ): readonly string[];
  validateSchema(schema: ToolSchema): readonly string[];
  validateExecutionContext(
    context: ToolExecutionContext,
  ): readonly string[];
  validateRegistryIntegrity(registry: IToolRegistry): readonly string[];
  validateExecutionResult(result: ToolExecutionResult): readonly string[];
  validateCallRequest(request: ToolCallRequest): readonly string[];
}
