export type DomainEventErrorCode =
  | "invalid_event"
  | "invalid_ordering"
  | "duplicate_sequence"
  | "invalid_timestamp"
  | "missing_metadata"
  | "missing_context"
  | "mutable_payload"
  | "invalid_event_type"
  | "dispatcher_sealed"
  | "unknown_subscriber";

/**
 * Domain error for the event system (not an HTTP / platform error).
 */
export class DomainEventError extends Error {
  readonly code: DomainEventErrorCode;

  constructor(code: DomainEventErrorCode, message: string) {
    super(message);
    this.name = "DomainEventError";
    this.code = code;
  }
}
