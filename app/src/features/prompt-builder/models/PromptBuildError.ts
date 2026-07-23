export class PromptBuildError extends Error {
  readonly code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "PromptBuildError";
    this.code = code;
  }
}
