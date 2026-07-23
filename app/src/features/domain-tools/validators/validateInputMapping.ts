import type { ToolInput } from "../../tool-calling/models/ToolInput";
import { hasParameter } from "../utils/extractParameter";

export type InputMappingValidationCode =
  | "missing_required_parameter"
  | "invalid_parameter_type"
  | "empty_parameters";

export interface InputMappingRule {
  readonly name: string;
  readonly required?: boolean;
  readonly type?: "object" | "string" | "number" | "boolean" | "any";
}

/**
 * Validate that ToolInput parameters can be mapped for a domain tool.
 * Structural checks only — no domain business rules.
 */
export function validateInputMapping(
  input: ToolInput,
  rules: readonly InputMappingRule[],
): readonly InputMappingValidationCode[] {
  const issues: InputMappingValidationCode[] = [];

  if (
    input.parameters === null ||
    typeof input.parameters !== "object" ||
    Array.isArray(input.parameters)
  ) {
    issues.push("empty_parameters");
    return Object.freeze([...issues]);
  }

  for (const rule of rules) {
    const present = hasParameter(input, rule.name);
    if (rule.required !== false && !present) {
      issues.push("missing_required_parameter");
      continue;
    }
    if (!present) {
      continue;
    }
    const value = input.parameters[rule.name];
    if (rule.type && rule.type !== "any" && !matchesType(value, rule.type)) {
      issues.push("invalid_parameter_type");
    }
  }

  return Object.freeze([...new Set(issues)]);
}

function matchesType(
  value: unknown,
  type: Exclude<InputMappingRule["type"], undefined | "any">,
): boolean {
  if (type === "object") {
    return value !== null && typeof value === "object" && !Array.isArray(value);
  }
  return typeof value === type;
}
