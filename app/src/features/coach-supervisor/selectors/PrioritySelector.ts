export const SUPERVISOR_PRIORITY_RANK = Object.freeze({
  critical: 0,
  high: 1,
  normal: 2,
  low: 3,
} as const);

export type SupervisorPriorityLevel = keyof typeof SUPERVISOR_PRIORITY_RANK;

export function comparePriority(
  a: SupervisorPriorityLevel,
  b: SupervisorPriorityLevel,
): number {
  return SUPERVISOR_PRIORITY_RANK[a] - SUPERVISOR_PRIORITY_RANK[b];
}

export function createPrioritySelector() {
  return { compare: comparePriority };
}
