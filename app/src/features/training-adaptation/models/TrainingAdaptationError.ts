/**
 * Domain error for training adaptation failures.
 */
export class TrainingAdaptationError extends Error {
  readonly code: string;
  readonly details: Readonly<Record<string, unknown>>;

  constructor(
    code: string,
    message: string,
    details: Readonly<Record<string, unknown>> = {},
  ) {
    super(message);
    this.name = "TrainingAdaptationError";
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}
