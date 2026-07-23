import type { ToolSchema } from "../models/ToolSchema";

export type SchemaValidationCode =
  | "invalid_schema_shape"
  | "invalid_parameter_name"
  | "duplicate_parameter_name"
  | "invalid_parameter_type";

/**
 * Validate a ToolSchema structural integrity.
 */
export function validateSchema(
  schema: ToolSchema,
): readonly SchemaValidationCode[] {
  const issues: SchemaValidationCode[] = [];

  if (!schema || !Array.isArray(schema.parameters)) {
    return Object.freeze(["invalid_schema_shape" as const]);
  }

  const names = new Set<string>();
  for (const param of schema.parameters) {
    if (
      !param ||
      typeof param.name !== "string" ||
      param.name.trim().length === 0
    ) {
      issues.push("invalid_parameter_name");
      break;
    }
    if (names.has(param.name)) {
      issues.push("duplicate_parameter_name");
      break;
    }
    names.add(param.name);

    if (typeof param.type !== "string" || param.type.trim().length === 0) {
      issues.push("invalid_parameter_type");
      break;
    }
  }

  return Object.freeze([...new Set(issues)]);
}
