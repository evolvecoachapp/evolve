import { MemoryCategory } from "../models/MemoryCategory";
import { MemoryEntry } from "../models/MemoryEntry";

export interface MemoryRepository {
  getAll(): Promise<MemoryEntry[]>;

  getById(id: string): Promise<MemoryEntry | null>;

  getByCategory(category: MemoryCategory): Promise<MemoryEntry[]>;

  save(entry: MemoryEntry): Promise<void>;

  delete(id: string): Promise<void>;

  clear(): Promise<void>;
}
