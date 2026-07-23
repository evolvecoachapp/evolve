import type { CoordinationPlan } from "../models/CoordinationPlan";
import { validateDependencies } from "../validators/validateDependencies";

export class DependencyCoordinator {
  coordinate(plan: CoordinationPlan) {
    return validateDependencies(plan);
  }
}

export function createDependencyCoordinator(): DependencyCoordinator {
  return new DependencyCoordinator();
}
