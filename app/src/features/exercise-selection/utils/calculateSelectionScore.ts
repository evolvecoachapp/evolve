import type { SelectionScore } from "../models/SelectionScore";

export interface SelectionScoreParts {
  readonly movementPattern?: number;
  readonly equipment?: number;
  readonly difficulty?: number;
  readonly goal?: number;
  readonly constraint?: number;
  readonly relationship?: number;
  readonly category?: number;
}

/**
 * Merge score axis contributions and recompute total.
 * Totals are rounded to 3 decimal places for stable equality.
 */
export function calculateSelectionScore(
  parts: SelectionScoreParts,
): SelectionScore {
  const movementPattern = parts.movementPattern ?? 0;
  const equipment = parts.equipment ?? 0;
  const difficulty = parts.difficulty ?? 0;
  const goal = parts.goal ?? 0;
  const constraint = parts.constraint ?? 0;
  const relationship = parts.relationship ?? 0;
  const category = parts.category ?? 0;
  const total = round3(
    movementPattern +
      equipment +
      difficulty +
      goal +
      constraint +
      relationship +
      category,
  );

  return Object.freeze({
    total,
    movementPattern: round3(movementPattern),
    equipment: round3(equipment),
    difficulty: round3(difficulty),
    goal: round3(goal),
    constraint: round3(constraint),
    relationship: round3(relationship),
    category: round3(category),
  });
}

/**
 * Combine multiple partial score maps into one SelectionScore.
 */
export function mergeScoreParts(
  ...partsList: readonly SelectionScoreParts[]
): SelectionScore {
  return calculateSelectionScore(
    partsList.reduce<Required<SelectionScoreParts>>(
      (acc, parts) => ({
        movementPattern: acc.movementPattern + (parts.movementPattern ?? 0),
        equipment: acc.equipment + (parts.equipment ?? 0),
        difficulty: acc.difficulty + (parts.difficulty ?? 0),
        goal: acc.goal + (parts.goal ?? 0),
        constraint: acc.constraint + (parts.constraint ?? 0),
        relationship: acc.relationship + (parts.relationship ?? 0),
        category: acc.category + (parts.category ?? 0),
      }),
      {
        movementPattern: 0,
        equipment: 0,
        difficulty: 0,
        goal: 0,
        constraint: 0,
        relationship: 0,
        category: 0,
      },
    ),
  );
}

function round3(value: number): number {
  return Math.round(value * 1000) / 1000;
}
