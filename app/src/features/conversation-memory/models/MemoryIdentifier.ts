import type { MemoryCategory } from "./MemoryCategory";
import type { MemoryScope } from "./MemoryScope";

/**
 * Stable identifier for a memory entry.
 */
export interface MemoryIdentifier {
  readonly id: string;
  readonly category: MemoryCategory;
  readonly scope: MemoryScope;
  readonly athleteId: string | null;
  readonly conversationId: string | null;
  readonly sessionId: string | null;
  readonly key: string | null;
}
