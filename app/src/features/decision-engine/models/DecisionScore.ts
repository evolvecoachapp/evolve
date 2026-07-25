/**
 * Immutable structural score — fixed tables, no domain math.
 */
export interface DecisionScore {
  readonly total: number;
  readonly priorityComponent: number;
  readonly confidenceComponent: number;
  readonly riskComponent: number;
  readonly impactComponent: number;
  readonly consistencyComponent: number;
}
