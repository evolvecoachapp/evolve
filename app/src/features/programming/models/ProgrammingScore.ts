/**
 * Aggregate quality / completeness score for a programmed prescription.
 * Axes correspond to independent programming strategies.
 */
export interface ProgrammingScore {
  readonly total: number;
  readonly volume: number;
  readonly intensity: number;
  readonly rest: number;
  readonly tempo: number;
  readonly order: number;
  readonly priority: number;
}

export function createEmptyProgrammingScore(): ProgrammingScore {
  return Object.freeze({
    total: 0,
    volume: 0,
    intensity: 0,
    rest: 0,
    tempo: 0,
    order: 0,
    priority: 0,
  });
}
