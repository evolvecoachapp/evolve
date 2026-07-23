import type { IDomainToolAdapter } from "../contracts/IDomainToolAdapter";
import { createAthleteToolAdapter } from "./AthleteToolAdapter";
import { createCoachToolAdapter } from "./CoachToolAdapter";
import { createRecoveryToolAdapter } from "./RecoveryToolAdapter";
import { createWorkoutToolAdapter } from "./WorkoutToolAdapter";

/**
 * Create the default Domain Tool Adapter set.
 *
 * Future adapters (nutrition, mobility, sleep, goal) register here
 * or via DomainToolService.registerAdapter.
 */
export function createDefaultDomainToolAdapters(): readonly IDomainToolAdapter[] {
  return Object.freeze([
    createWorkoutToolAdapter(),
    createRecoveryToolAdapter(),
    createCoachToolAdapter(),
    createAthleteToolAdapter(),
  ]);
}
