/**
 * Immutable repository adapter registration / validation errors.
 */

function freezeErrorDetails(
  details: Readonly<Record<string, string | number | boolean | null>>,
): Readonly<Record<string, string | number | boolean | null>> {
  return Object.freeze({ ...details });
}

export class RepositoryAdapterRegistrationError extends Error {
  readonly code = "repository_adapter_registration_error" as const;
  readonly adapterId: string;
  readonly details: Readonly<Record<string, string | number | boolean | null>>;

  constructor(adapterId: string, message?: string) {
    super(message ?? `Repository adapter registration error: ${adapterId}`);
    this.name = "RepositoryAdapterRegistrationError";
    this.adapterId = adapterId;
    this.details = freezeErrorDetails({ adapterId });
    Object.freeze(this);
  }
}

export class RepositoryAdapterValidationError extends Error {
  readonly code = "repository_adapter_validation_error" as const;
  readonly issues: readonly string[];
  readonly details: Readonly<Record<string, string | number | boolean | null>>;

  constructor(issues: readonly string[], message?: string) {
    const frozenIssues = Object.freeze([...issues]);
    super(
      message ??
        (frozenIssues.length > 0
          ? `Repository adapter validation error: ${frozenIssues.join("; ")}`
          : "Repository adapter validation error"),
    );
    this.name = "RepositoryAdapterValidationError";
    this.issues = frozenIssues;
    this.details = freezeErrorDetails({
      issueCount: frozenIssues.length,
    });
    Object.freeze(this);
  }
}

export class RepositoryAdapterNotFoundError extends Error {
  readonly code = "repository_adapter_not_found" as const;
  readonly adapterId: string;
  readonly details: Readonly<Record<string, string | number | boolean | null>>;

  constructor(adapterId: string, message?: string) {
    super(message ?? `Repository adapter not found: ${adapterId}`);
    this.name = "RepositoryAdapterNotFoundError";
    this.adapterId = adapterId;
    this.details = freezeErrorDetails({ adapterId });
    Object.freeze(this);
  }
}
