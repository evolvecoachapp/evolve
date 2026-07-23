import type { ActionDependency } from "../models/ActionDependency";
import type { ActionStep } from "../models/ActionStep";
import {
  stepsMissingDependencies,
  topologicalStepOrder,
} from "../utils/dependencyHelpers";

/**
 * Deterministic dependency selection / ordering.
 */
export class DependencySelector {
  selectBlocking(
    steps: readonly ActionStep[],
  ): readonly ActionStep[] {
    return stepsMissingDependencies(steps);
  }

  selectOrderedIds(steps: readonly ActionStep[]): readonly string[] {
    return topologicalStepOrder(steps);
  }

  selectEdgesForStep(
    dependencies: readonly ActionDependency[],
    stepId: string,
  ): readonly ActionDependency[] {
    return Object.freeze(
      dependencies.filter(
        (d) => d.fromStepId === stepId || d.toStepId === stepId,
      ),
    );
  }
}
