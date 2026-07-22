import type { WorkoutBlueprint } from "../models/WorkoutBlueprint";
import { WorkoutBlueprintError } from "../models/WorkoutBlueprintError";
import { freezeBlueprint } from "../utils/freezeBlueprint";
import { validateBlueprint } from "../validators/validateBlueprint";
import type { WorkoutBlueprintRepository } from "./WorkoutBlueprintRepository";

/**
 * Ephemeral in-process WorkoutBlueprintRepository.
 *
 * Suitable for tests and offline orchestration — not durable storage.
 */
export class InMemoryWorkoutBlueprintRepository
  implements WorkoutBlueprintRepository
{
  private readonly blueprints = new Map<string, WorkoutBlueprint>();

  async save(blueprint: WorkoutBlueprint): Promise<WorkoutBlueprint> {
    const issues = validateBlueprint(blueprint);
    if (issues.length > 0) {
      throw new WorkoutBlueprintError(
        "invalid_blueprint",
        `Invalid workout blueprint: ${issues.join(",")}`,
        { blueprintId: blueprint.id, issues },
      );
    }

    const cloned = freezeBlueprint(blueprint);
    this.blueprints.set(cloned.id, cloned);
    return freezeBlueprint(cloned);
  }

  async load(id: string): Promise<WorkoutBlueprint | null> {
    const blueprint = this.blueprints.get(id);
    return blueprint ? freezeBlueprint(blueprint) : null;
  }

  async list(): Promise<readonly WorkoutBlueprint[]> {
    return Object.freeze(
      [...this.blueprints.values()].map((blueprint) =>
        freezeBlueprint(blueprint),
      ),
    );
  }

  async delete(id: string): Promise<boolean> {
    return this.blueprints.delete(id);
  }

  /** Test helper — replace store synchronously. */
  seed(blueprints: readonly WorkoutBlueprint[]): void {
    this.blueprints.clear();
    for (const blueprint of blueprints) {
      this.blueprints.set(blueprint.id, freezeBlueprint(blueprint));
    }
  }
}
