import type { ToolInput } from "../models/ToolInput";
import type { ToolParameter } from "../models/ToolParameter";
import type { ToolSchema } from "../models/ToolSchema";
import { EMPTY_TOOL_SCHEMA } from "../models/ToolSchema";

export function createParameter(input: {
  readonly name: string;
  readonly type?: string;
  readonly description?: string;
  readonly required?: boolean;
  readonly defaultValue?: unknown | null;
}): ToolParameter {
  return Object.freeze({
    name: input.name,
    type: input.type ?? "unknown",
    description: input.description ?? "",
    required: input.required ?? false,
    defaultValue: input.defaultValue ?? null,
  });
}

export function createSchema(input: {
  readonly parameters?: readonly ToolParameter[];
  readonly returns?: string | null;
} = {}): ToolSchema {
  return Object.freeze({
    parameters: Object.freeze([...(input.parameters ?? [])]),
    returns: input.returns ?? null,
  });
}

export function schemaParameterNames(schema: ToolSchema): readonly string[] {
  return Object.freeze(schema.parameters.map((p) => p.name));
}

export function requiredParameterNames(schema: ToolSchema): readonly string[] {
  return Object.freeze(
    schema.parameters.filter((p) => p.required).map((p) => p.name),
  );
}

export function inputHasParameter(
  input: ToolInput,
  name: string,
): boolean {
  return Object.prototype.hasOwnProperty.call(input.parameters, name);
}

export function emptySchema(): ToolSchema {
  return EMPTY_TOOL_SCHEMA;
}
