export class NotificationRuntimeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NotificationRuntimeError";
  }
}
