import { MemoryCategory } from "../models/MemoryCategory";
import { MemoryEntry } from "../models/MemoryEntry";
import { MemoryImportance } from "../models/MemoryImportance";
import { MemoryEngine } from "./MemoryEngine";

export class MemoryManager {
  constructor(private readonly engine: MemoryEngine) {}

  async save(memory: MemoryEntry): Promise<void> {
    this.validate(memory);
    return this.engine.save(memory);
  }

  async saveMany(memories: MemoryEntry[]): Promise<void> {
    for (const memory of memories) {
      await this.save(memory);
    }
  }

  async exists(id: string): Promise<boolean> {
    return this.engine.has(id);
  }

  async remove(id: string): Promise<void> {
    return this.engine.delete(id);
  }

  async removeAll(): Promise<void> {
    return this.engine.clear();
  }

  async getAll(): Promise<MemoryEntry[]> {
    return this.engine.getAll();
  }

  private validate(memory: MemoryEntry): void {
    if (!memory.id || memory.id.trim().length === 0) {
      throw new Error("MemoryEntry id must not be empty");
    }

    if (!memory.category || !Object.values(MemoryCategory).includes(memory.category)) {
      throw new Error("MemoryEntry category must be a valid MemoryCategory");
    }

    if (!Object.values(MemoryImportance).includes(memory.importance)) {
      throw new Error("MemoryEntry importance must be a valid MemoryImportance");
    }
  }
}
