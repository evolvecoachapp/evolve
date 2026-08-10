export class ProgressRuntimeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ProgressRuntimeError";
  }
}
