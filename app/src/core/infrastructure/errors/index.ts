/**
 * Immutable infrastructure adapter error models.
 * Errors carry frozen details; no I/O, no implementations.
 */

function freezeErrorDetails(
  details: Readonly<Record<string, string | number | boolean | null>>,
): Readonly<Record<string, string | number | boolean | null>> {
  return Object.freeze({ ...details });
}

export class AdapterNotFoundError extends Error {
  readonly code = "adapter_not_found" as const;
  readonly adapterId: string;
  readonly details: Readonly<Record<string, string | number | boolean | null>>;

  constructor(adapterId: string, message?: string) {
    super(message ?? `Adapter not found: ${adapterId}`);
    this.name = "AdapterNotFoundError";
    this.adapterId = adapterId;
    this.details = freezeErrorDetails({ adapterId });
    Object.freeze(this);
  }
}

export class AdapterCapabilityError extends Error {
  readonly code = "adapter_capability_error" as const;
  readonly adapterId: string;
  readonly capability: string;
  readonly details: Readonly<Record<string, string | number | boolean | null>>;

  constructor(adapterId: string, capability: string, message?: string) {
    super(
      message ??
        `Adapter capability error: ${capability} on ${adapterId}`,
    );
    this.name = "AdapterCapabilityError";
    this.adapterId = adapterId;
    this.capability = capability;
    this.details = freezeErrorDetails({ adapterId, capability });
    Object.freeze(this);
  }
}

export class AdapterRegistrationError extends Error {
  readonly code = "adapter_registration_error" as const;
  readonly adapterId: string;
  readonly details: Readonly<Record<string, string | number | boolean | null>>;

  constructor(adapterId: string, message?: string) {
    super(message ?? `Adapter registration error: ${adapterId}`);
    this.name = "AdapterRegistrationError";
    this.adapterId = adapterId;
    this.details = freezeErrorDetails({ adapterId });
    Object.freeze(this);
  }
}

export class AdapterValidationError extends Error {
  readonly code = "adapter_validation_error" as const;
  readonly issues: readonly string[];
  readonly details: Readonly<Record<string, string | number | boolean | null>>;

  constructor(issues: readonly string[], message?: string) {
    const frozenIssues = Object.freeze([...issues]);
    super(
      message ??
        (frozenIssues.length > 0
          ? `Adapter validation error: ${frozenIssues.join("; ")}`
          : "Adapter validation error"),
    );
    this.name = "AdapterValidationError";
    this.issues = frozenIssues;
    this.details = freezeErrorDetails({
      issueCount: frozenIssues.length,
    });
    Object.freeze(this);
  }
}

export class UnsupportedAdapterError extends Error {
  readonly code = "unsupported_adapter" as const;
  readonly adapterId: string;
  readonly details: Readonly<Record<string, string | number | boolean | null>>;

  constructor(adapterId: string, message?: string) {
    super(message ?? `Unsupported adapter: ${adapterId}`);
    this.name = "UnsupportedAdapterError";
    this.adapterId = adapterId;
    this.details = freezeErrorDetails({ adapterId });
    Object.freeze(this);
  }
}
