/**
 * Immutable synchronization provider registration / validation errors.
 */

function freezeErrorDetails(
  details: Readonly<Record<string, string | number | boolean | null>>,
): Readonly<Record<string, string | number | boolean | null>> {
  return Object.freeze({ ...details });
}

export class SynchronizationProviderRegistrationError extends Error {
  readonly code = "synchronization_provider_registration_error" as const;
  readonly providerId: string;
  readonly details: Readonly<Record<string, string | number | boolean | null>>;

  constructor(providerId: string, message?: string) {
    super(
      message ?? `Synchronization provider registration error: ${providerId}`,
    );
    this.name = "SynchronizationProviderRegistrationError";
    this.providerId = providerId;
    this.details = freezeErrorDetails({ providerId });
    Object.freeze(this);
  }
}

export class SynchronizationProviderValidationError extends Error {
  readonly code = "synchronization_provider_validation_error" as const;
  readonly issues: readonly string[];
  readonly details: Readonly<Record<string, string | number | boolean | null>>;

  constructor(issues: readonly string[], message?: string) {
    const frozenIssues = Object.freeze([...issues]);
    super(
      message ??
        (frozenIssues.length > 0
          ? `Synchronization provider validation error: ${frozenIssues.join("; ")}`
          : "Synchronization provider validation error"),
    );
    this.name = "SynchronizationProviderValidationError";
    this.issues = frozenIssues;
    this.details = freezeErrorDetails({
      issueCount: frozenIssues.length,
    });
    Object.freeze(this);
  }
}

export class SynchronizationProviderNotFoundError extends Error {
  readonly code = "synchronization_provider_not_found" as const;
  readonly providerId: string;
  readonly details: Readonly<Record<string, string | number | boolean | null>>;

  constructor(providerId: string, message?: string) {
    super(message ?? `Synchronization provider not found: ${providerId}`);
    this.name = "SynchronizationProviderNotFoundError";
    this.providerId = providerId;
    this.details = freezeErrorDetails({ providerId });
    Object.freeze(this);
  }
}
