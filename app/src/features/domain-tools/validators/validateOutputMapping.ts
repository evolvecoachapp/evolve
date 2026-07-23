export type OutputMappingValidationCode =
  | "missing_output"
  | "invalid_output_shape";

/**
 * Validate that a domain result can be mapped into ToolOutput.data.
 * Structural checks only.
 */
export function validateOutputMapping(
  data: unknown,
): readonly OutputMappingValidationCode[] {
  const issues: OutputMappingValidationCode[] = [];

  if (data === undefined) {
    issues.push("missing_output");
  }

  if (data !== null && typeof data === "function") {
    issues.push("invalid_output_shape");
  }

  return Object.freeze([...new Set(issues)]);
}
