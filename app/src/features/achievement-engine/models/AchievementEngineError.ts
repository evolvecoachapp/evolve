/**
 * Typed error for Achievement Engine hard failures.
 */
export class AchievementEngineError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "AchievementEngineError";
    this.code = code;
  }
}
