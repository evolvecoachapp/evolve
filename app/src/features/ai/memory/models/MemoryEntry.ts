import { MemoryCategory } from "./MemoryCategory";
import { MemoryImportance } from "./MemoryImportance";

export interface MemoryEntry {
  id: string;

  category: MemoryCategory;

  importance: MemoryImportance;

  title: string;

  value: unknown;

  createdAt: Date;

  updatedAt: Date;

  expiresAt?: Date;

  tags: string[];
}