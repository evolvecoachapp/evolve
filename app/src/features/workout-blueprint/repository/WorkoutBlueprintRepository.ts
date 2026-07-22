import type { WorkoutBlueprint } from "../models/WorkoutBlueprint";

/**
 * Persistence boundary for WorkoutBlueprint.
 *
 * No durable storage in this sprint — in-memory only.
 */
export interface WorkoutBlueprintRepository {
  save(blueprint: WorkoutBlueprint): Promise<WorkoutBlueprint>;
  load(id: string): Promise<WorkoutBlueprint | null>;
  list(): Promise<readonly WorkoutBlueprint[]>;
  delete(id: string): Promise<boolean>;
}
