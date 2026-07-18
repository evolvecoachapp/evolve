import { MemoryError } from "./MemoryError";

export class MemoryNotFoundError extends MemoryError {
  constructor(message: string = "Memory not found.") {
    super(message);
    this.name = "MemoryNotFoundError";
  }
}
