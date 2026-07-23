import type { ActionStep } from "../models/ActionStep";
import {
  hasCircularDependencies,
  stepsMissingDependencies,
} from "../utils/dependencyHelpers";

/**
 * Dependency policy — structural dependency rules only.
 */
export interface DependencyPolicy {
  readonly id: string;
  isSatisfied(steps: readonly ActionStep[]): boolean;
  unsatisfiedSteps(steps: readonly ActionStep[]): readonly ActionStep[];
}

export class DefaultDependencyPolicy implements DependencyPolicy {
  readonly id = "policy:dependency:default";

  isSatisfied(steps: readonly ActionStep[]): boolean {
    return (
      stepsMissingDependencies(steps).length === 0 &&
      !hasCircularDependencies(steps)
    );
  }

  unsatisfiedSteps(steps: readonly ActionStep[]): readonly ActionStep[] {
    return stepsMissingDependencies(steps);
  }
}
