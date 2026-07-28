/**
 * Immutable logger registration / validation errors.
 */

function freezeErrorDetails(
  details: Readonly<Record<string, string | number | boolean | null>>,
): Readonly<Record<string, string | number | boolean | null>> {
  return Object.freeze({ ...details });
}

export class LoggerRegistrationError extends Error {
  readonly code = "logger_registration_error" as const;
  readonly loggerId: string;
  readonly details: Readonly<Record<string, string | number | boolean | null>>;

  constructor(loggerId: string, message?: string) {
    super(message ?? `Logger registration error: ${loggerId}`);
    this.name = "LoggerRegistrationError";
    this.loggerId = loggerId;
    this.details = freezeErrorDetails({ loggerId });
    Object.freeze(this);
  }
}

export class LoggerValidationError extends Error {
  readonly code = "logger_validation_error" as const;
  readonly issues: readonly string[];
  readonly details: Readonly<Record<string, string | number | boolean | null>>;

  constructor(issues: readonly string[], message?: string) {
    const frozenIssues = Object.freeze([...issues]);
    super(
      message ??
        (frozenIssues.length > 0
          ? `Logger validation error: ${frozenIssues.join("; ")}`
          : "Logger validation error"),
    );
    this.name = "LoggerValidationError";
    this.issues = frozenIssues;
    this.details = freezeErrorDetails({
      issueCount: frozenIssues.length,
    });
    Object.freeze(this);
  }
}

export class LoggerNotFoundError extends Error {
  readonly code = "logger_not_found" as const;
  readonly loggerId: string;
  readonly details: Readonly<Record<string, string | number | boolean | null>>;

  constructor(loggerId: string, message?: string) {
    super(message ?? `Logger not found: ${loggerId}`);
    this.name = "LoggerNotFoundError";
    this.loggerId = loggerId;
    this.details = freezeErrorDetails({ loggerId });
    Object.freeze(this);
  }
}
