import { MemoryCategory } from "../models/MemoryCategory";
import { MemoryEntry } from "../models/MemoryEntry";
import { MemoryRepository } from "../repository/MemoryRepository";

export class MemoryEngine {
  constructor(private readonly repository: MemoryRepository) {}

  async save(memory: MemoryEntry): Promise<void> {
    return this.repository.save(memory);
  }

  async getAll(): Promise<MemoryEntry[]> {
    return this.repository.getAll();
  }

  async getById(id: string): Promise<MemoryEntry | null> {
    return this.repository.getById(id);
  }

  async getByCategory(category: MemoryCategory): Promise<MemoryEntry[]> {
    return this.repository.getByCategory(category);
  }

  async delete(id: string): Promise<void> {
    return this.repository.delete(id);
  }

  async clear(): Promise<void> {
    return this.repository.clear();
  }
}
