import { MemoryCategory } from "../models/MemoryCategory";
import { MemoryEntry } from "../models/MemoryEntry";
import { MemoryRepository } from "./MemoryRepository";

export class InMemoryRepository implements MemoryRepository {
  private readonly memories = new Map<string, MemoryEntry>();

  async getAll(): Promise<MemoryEntry[]> {
    return Array.from(this.memories.values());
  }

  async getById(id: string): Promise<MemoryEntry | null> {
    return this.memories.get(id) ?? null;
  }

  async getByCategory(category: MemoryCategory): Promise<MemoryEntry[]> {
    return Array.from(this.memories.values()).filter(
      (memory) => memory.category === category,
    );
  }

  async save(entry: MemoryEntry): Promise<void> {
    this.memories.set(entry.id, entry);
  }

  async delete(id: string): Promise<void> {
    this.memories.delete(id);
  }

  async clear(): Promise<void> {
    this.memories.clear();
  }
}
