/**
 * Deterministic priority for memory retention / conflict resolution.
 * Higher numeric values win.
 */
export const MemoryPriorities = {
  LOW: 10,
  NORMAL: 50,
  HIGH: 80,
  CRITICAL: 100,
} as const;

export type MemoryPriority =
  (typeof MemoryPriorities)[keyof typeof MemoryPriorities];

export const ALL_MEMORY_PRIORITIES: readonly MemoryPriority[] = Object.freeze([
  MemoryPriorities.LOW,
  MemoryPriorities.NORMAL,
  MemoryPriorities.HIGH,
  MemoryPriorities.CRITICAL,
]);
