import type { IToolRegistry } from "../contracts/IToolRegistry";
import type { IToolValidator } from "../contracts/IToolValidator";
import type { ToolCallRequest } from "../models/ToolCallRequest";
import type { ToolExecutionContext } from "../models/ToolExecutionContext";
import type { ToolExecutionResult } from "../models/ToolExecutionResult";
import type { ToolInput } from "../models/ToolInput";
import type { ToolSchema } from "../models/ToolSchema";
import { validateCallRequest } from "./validateCallRequest";
import { validateExecutionContext } from "./validateExecutionContext";
import { validateExecutionResult } from "./validateExecutionResult";
import { validateParameters } from "./validateParameters";
import { validateRegistryIntegrity } from "./validateRegistryIntegrity";
import { validateSchema } from "./validateSchema";
import { validateToolId } from "./validateToolId";

/** Concrete IToolValidator wiring foundation validators. */
export class ToolValidator implements IToolValidator {
  validateToolId(toolId: string): readonly string[] {
    return validateToolId(toolId);
  }

  validateParameters(
    input: ToolInput,
    schema: ToolSchema,
  ): readonly string[] {
    return validateParameters(input, schema);
  }

  validateSchema(schema: ToolSchema): readonly string[] {
    return validateSchema(schema);
  }

  validateExecutionContext(
    context: ToolExecutionContext,
  ): readonly string[] {
    return validateExecutionContext(context);
  }

  validateRegistryIntegrity(registry: IToolRegistry): readonly string[] {
    return validateRegistryIntegrity(registry);
  }

  validateExecutionResult(result: ToolExecutionResult): readonly string[] {
    return validateExecutionResult(result);
  }

  validateCallRequest(request: ToolCallRequest): readonly string[] {
    return validateCallRequest(request);
  }
}

export function createToolValidator(): ToolValidator {
  return new ToolValidator();
}
