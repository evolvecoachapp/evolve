/**
 * Domain error for exercise knowledge base failures.
 */
export class ExerciseKnowledgeError extends Error {
  readonly code: string;
  readonly details: Readonly<Record<string, unknown>>;

  constructor(
    code: string,
    message: string,
    details: Readonly<Record<string, unknown>> = {},
  ) {
    super(message);
    this.name = "ExerciseKnowledgeError";
    this.code = code;
    this.details = Object.freeze({ ...details });
  }
}
