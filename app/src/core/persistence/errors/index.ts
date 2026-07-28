/**
 * Immutable persistence error models.
 * Errors carry frozen details; no I/O, no adapters.
 */

function freezeErrorDetails(
  details: Readonly<Record<string, string | number | boolean | null>>,
): Readonly<Record<string, string | number | boolean | null>> {
  return Object.freeze({ ...details });
}

export class RepositoryNotFoundError extends Error {
  readonly code = "repository_not_found" as const;
  readonly repositoryId: string;
  readonly details: Readonly<Record<string, string | number | boolean | null>>;

  constructor(repositoryId: string, message?: string) {
    super(message ?? `Repository not found: ${repositoryId}`);
    this.name = "RepositoryNotFoundError";
    this.repositoryId = repositoryId;
    this.details = freezeErrorDetails({ repositoryId });
    Object.freeze(this);
  }
}

export class StorageUnavailableError extends Error {
  readonly code = "storage_unavailable" as const;
  readonly backendId: string | null;
  readonly details: Readonly<Record<string, string | number | boolean | null>>;

  constructor(backendId: string | null = null, message?: string) {
    super(
      message ??
        (backendId
          ? `Storage unavailable: ${backendId}`
          : "Storage unavailable"),
    );
    this.name = "StorageUnavailableError";
    this.backendId = backendId;
    this.details = freezeErrorDetails({ backendId });
    Object.freeze(this);
  }
}

export class ContractViolationError extends Error {
  readonly code = "contract_violation" as const;
  readonly contractId: string;
  readonly details: Readonly<Record<string, string | number | boolean | null>>;

  constructor(contractId: string, message?: string) {
    super(message ?? `Contract violation: ${contractId}`);
    this.name = "ContractViolationError";
    this.contractId = contractId;
    this.details = freezeErrorDetails({ contractId });
    Object.freeze(this);
  }
}

export class TransactionFailureError extends Error {
  readonly code = "transaction_failure" as const;
  readonly sessionId: string | null;
  readonly details: Readonly<Record<string, string | number | boolean | null>>;

  constructor(sessionId: string | null = null, message?: string) {
    super(
      message ??
        (sessionId
          ? `Transaction failure: ${sessionId}`
          : "Transaction failure"),
    );
    this.name = "TransactionFailureError";
    this.sessionId = sessionId;
    this.details = freezeErrorDetails({ sessionId });
    Object.freeze(this);
  }
}

export class ValidationError extends Error {
  readonly code = "validation_error" as const;
  readonly issues: readonly string[];
  readonly details: Readonly<Record<string, string | number | boolean | null>>;

  constructor(issues: readonly string[], message?: string) {
    const frozenIssues = Object.freeze([...issues]);
    super(
      message ??
        (frozenIssues.length > 0
          ? `Validation error: ${frozenIssues.join("; ")}`
          : "Validation error"),
    );
    this.name = "ValidationError";
    this.issues = frozenIssues;
    this.details = freezeErrorDetails({
      issueCount: frozenIssues.length,
    });
    Object.freeze(this);
  }
}
