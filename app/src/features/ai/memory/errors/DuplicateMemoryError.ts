import { MemoryError } from "./MemoryError";

export class DuplicateMemoryError extends MemoryError {
  constructor(message: string = "Memory already exists.") {
    super(message);
    this.name = "DuplicateMemoryError";
  }
}
