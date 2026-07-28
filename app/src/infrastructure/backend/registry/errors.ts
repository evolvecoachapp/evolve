/**
 * Immutable backend provider registration / validation errors.
 */

function freezeErrorDetails(
  details: Readonly<Record<string, string | number | boolean | null>>,
): Readonly<Record<string, string | number | boolean | null>> {
  return Object.freeze({ ...details });
}

export class BackendRegistrationError extends Error {
  readonly code = "backend_registration_error" as const;
  readonly providerId: string;
  readonly details: Readonly<Record<string, string | number | boolean | null>>;

  constructor(providerId: string, message?: string) {
    super(message ?? `Backend registration error: ${providerId}`);
    this.name = "BackendRegistrationError";
    this.providerId = providerId;
    this.details = freezeErrorDetails({ providerId });
    Object.freeze(this);
  }
}

export class BackendValidationError extends Error {
  readonly code = "backend_validation_error" as const;
  readonly issues: readonly string[];
  readonly details: Readonly<Record<string, string | number | boolean | null>>;

  constructor(issues: readonly string[], message?: string) {
    const frozenIssues = Object.freeze([...issues]);
    super(
      message ??
        (frozenIssues.length > 0
          ? `Backend validation error: ${frozenIssues.join("; ")}`
          : "Backend validation error"),
    );
    this.name = "BackendValidationError";
    this.issues = frozenIssues;
    this.details = freezeErrorDetails({
      issueCount: frozenIssues.length,
    });
    Object.freeze(this);
  }
}

export class BackendProviderNotFoundError extends Error {
  readonly code = "backend_provider_not_found" as const;
  readonly providerId: string;
  readonly details: Readonly<Record<string, string | number | boolean | null>>;

  constructor(providerId: string, message?: string) {
    super(message ?? `Backend provider not found: ${providerId}`);
    this.name = "BackendProviderNotFoundError";
    this.providerId = providerId;
    this.details = freezeErrorDetails({ providerId });
    Object.freeze(this);
  }
}
