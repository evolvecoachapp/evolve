import {
  WorkoutBlueprintBuilder,
  type WorkoutBlueprintBuilderOptions,
} from "../builder/WorkoutBlueprintBuilder";
import type { WorkoutBlueprint } from "../models/WorkoutBlueprint";
import type { WorkoutBlueprintAIOutput } from "../models/WorkoutBlueprintAIOutput";
import { WorkoutBlueprintError } from "../models/WorkoutBlueprintError";
import type { WorkoutBlueprintResult } from "../models/WorkoutBlueprintResult";
import type { WorkoutBlueprintRepository } from "../repository/WorkoutBlueprintRepository";
import { freezeBlueprint } from "../utils/freezeBlueprint";
import { validateBlueprint } from "../validators/validateBlueprint";

/**
 * Domain service for workout blueprint generation and storage.
 *
 * Never contains AI prompt logic. Never selects exercises.
 */
export class WorkoutBlueprintService {
  constructor(
    private readonly repository: WorkoutBlueprintRepository,
    private readonly builder: WorkoutBlueprintBuilder = new WorkoutBlueprintBuilder(),
  ) {}

  /**
   * Generate, validate, store, and return an immutable blueprint.
   */
  async generate(
    aiOutput: WorkoutBlueprintAIOutput | unknown,
    options: WorkoutBlueprintBuilderOptions = {},
  ): Promise<WorkoutBlueprintResult> {
    const blueprint = this.builder.build(aiOutput, options);
    const stored = await this.repository.save(blueprint);
    const issues = validateBlueprint(stored);

    return Object.freeze({
      blueprint: freezeBlueprint(stored),
      validationIssues: issues,
      generatedAt: stored.metadata.createdAt,
    });
  }

  /** Validate without persisting. */
  validate(blueprint: WorkoutBlueprint): readonly string[] {
    return validateBlueprint(blueprint);
  }

  /** Persist a validated blueprint and return an immutable copy. */
  async store(blueprint: WorkoutBlueprint): Promise<WorkoutBlueprint> {
    const issues = validateBlueprint(blueprint);
    if (issues.length > 0) {
      throw new WorkoutBlueprintError(
        "invalid_blueprint",
        `Invalid workout blueprint: ${issues.join(",")}`,
        { blueprintId: blueprint.id, issues },
      );
    }
    return this.repository.save(freezeBlueprint(blueprint));
  }

  async load(id: string): Promise<WorkoutBlueprint | null> {
    const blueprint = await this.repository.load(id);
    return blueprint ? freezeBlueprint(blueprint) : null;
  }

  async list(): Promise<readonly WorkoutBlueprint[]> {
    const blueprints = await this.repository.list();
    return Object.freeze(
      blueprints.map((blueprint) => freezeBlueprint(blueprint)),
    );
  }

  async delete(id: string): Promise<boolean> {
    return this.repository.delete(id);
  }
}
