/**
 * Hard failure from Prompt Composition Engine.
 */
export class PromptEngineError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "PromptEngineError";
    this.code = code;
  }
}
