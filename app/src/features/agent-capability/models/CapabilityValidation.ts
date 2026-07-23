/**
 * Validation codes for Agent Capability integrity checks.
 */
export const CapabilityValidationCodes = {
  MISSING_FIELD: "missing_field",
  INVALID_VALUE: "invalid_value",
  INVALID_IDENTIFIER: "invalid_identifier",
  DUPLICATE_CAPABILITY: "duplicate_capability",
  OWNERSHIP_CONFLICT: "ownership_conflict",
  REGISTRY_INCONSISTENT: "registry_inconsistent",
  REGISTRATION_INVALID: "registration_invalid",
  DESCRIPTOR_INVALID: "descriptor_invalid",
  NOT_FOUND: "not_found",
  DISABLED: "disabled",
} as const;

export type CapabilityValidationCode =
  (typeof CapabilityValidationCodes)[keyof typeof CapabilityValidationCodes];

export interface CapabilityValidationIssue {
  readonly code: CapabilityValidationCode;
  readonly message: string;
  readonly path: string;
}

export interface CapabilityValidation {
  readonly valid: boolean;
  readonly issues: readonly CapabilityValidationIssue[];
}
