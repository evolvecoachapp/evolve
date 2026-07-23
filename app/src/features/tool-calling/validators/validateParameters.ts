import type { ToolInput } from "../models/ToolInput";
import type { ToolSchema } from "../models/ToolSchema";

export type ParameterValidationCode =
  | "invalid_parameters_shape"
  | "missing_required_parameter"
  | "unknown_parameter";

/**
 * Validate ToolInput against a ToolSchema.
 */
export function validateParameters(
  input: ToolInput,
  schema: ToolSchema,
): readonly ParameterValidationCode[] {
  const issues: ParameterValidationCode[] = [];

  if (!input || typeof input.parameters !== "object" || input.parameters === null) {
    return Object.freeze(["invalid_parameters_shape" as const]);
  }

  const provided = new Set(Object.keys(input.parameters));
  const known = new Set(schema.parameters.map((p) => p.name));

  for (const param of schema.parameters) {
    if (param.required && !provided.has(param.name)) {
      issues.push("missing_required_parameter");
      break;
    }
  }

  for (const name of provided) {
    if (!known.has(name) && known.size > 0) {
      issues.push("unknown_parameter");
      break;
    }
  }

  return Object.freeze([...new Set(issues)]);
}
