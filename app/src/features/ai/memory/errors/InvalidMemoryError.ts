import { MemoryError } from "./MemoryError";

export class InvalidMemoryError extends MemoryError {
  constructor(message: string = "Invalid memory.") {
    super(message);
    this.name = "InvalidMemoryError";
  }
}
