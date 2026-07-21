/** Structured validation issue codes — never prose. */
export type ConfigurationValidationCode =
  | "missing_provider"
  | "unsupported_provider"
  | "missing_model"
  | "invalid_model"
  | "invalid_timeout"
  | "invalid_retries"
  | "invalid_max_output_tokens"
  | "missing_api_key";

/** Single structured validation issue. */
export interface ConfigurationValidationIssue {
  readonly field: string;
  readonly code: ConfigurationValidationCode;
}

/**
 * Result of validating an AIConfiguration.
 *
 * Validation failures never throw — callers inspect `valid` / `issues`.
 */
export interface ConfigurationValidationResult {
  readonly valid: boolean;
  readonly issues: readonly ConfigurationValidationIssue[];
}
