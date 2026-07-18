import { MemoryCategory } from "../models/MemoryCategory";
import { MemoryEntry } from "../models/MemoryEntry";
import { MemoryImportance } from "../models/MemoryImportance";
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

  async has(id: string): Promise<boolean> {
    const memory = await this.repository.getById(id);
    return memory !== null;
  }

  async findByTag(tag: string): Promise<MemoryEntry[]> {
    const normalizedTag = tag.toLowerCase();
    const memories = await this.repository.getAll();
    return memories.filter((memory) =>
      memory.tags.some((memoryTag) => memoryTag.toLowerCase() === normalizedTag),
    );
  }

  async findByImportance(importance: MemoryImportance): Promise<MemoryEntry[]> {
    const memories = await this.repository.getAll();
    return memories.filter((memory) => memory.importance === importance);
  }

  async findBetween(start: Date, end: Date): Promise<MemoryEntry[]> {
    const startTime = start.getTime();
    const endTime = end.getTime();
    const memories = await this.repository.getAll();
    return memories.filter((memory) => {
      const createdAtTime = memory.createdAt.getTime();
      return createdAtTime >= startTime && createdAtTime <= endTime;
    });
  }

  async search(text: string): Promise<MemoryEntry[]> {
    const normalizedText = text.toLowerCase();
    const memories = await this.repository.getAll();
    return memories.filter((memory) => {
      const titleMatches = memory.title.toLowerCase().includes(normalizedText);
      const tagMatches = memory.tags.some((tag) =>
        tag.toLowerCase().includes(normalizedText),
      );
      const valueMatches =
        typeof memory.value === "string" &&
        memory.value.toLowerCase().includes(normalizedText);
      return titleMatches || tagMatches || valueMatches;
    });
  }
}
