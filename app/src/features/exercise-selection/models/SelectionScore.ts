/**
 * Deterministic multi-axis fit score for a candidate exercise.
 * Higher total is better. Never randomized.
 */
export interface SelectionScore {
  readonly total: number;
  readonly movementPattern: number;
  readonly equipment: number;
  readonly difficulty: number;
  readonly goal: number;
  readonly constraint: number;
  readonly relationship: number;
  readonly category: number;
}

export function createEmptySelectionScore(): SelectionScore {
  return Object.freeze({
    total: 0,
    movementPattern: 0,
    equipment: 0,
    difficulty: 0,
    goal: 0,
    constraint: 0,
    relationship: 0,
    category: 0,
  });
}
