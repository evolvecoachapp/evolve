import type { EquipmentCode } from "../models/EquipmentRequirement";
import type { ExerciseDefinition } from "../models/ExerciseDefinition";
import type { MovementPatternCode } from "../models/MovementPattern";
import type { ExerciseTagCode } from "../models/ExerciseTag";
import { freezeExerciseDefinition } from "../utils/freezeExerciseDefinition";
import { validateExerciseDefinition } from "../validators/validateExerciseDefinition";
import { ExerciseKnowledgeError } from "../models/ExerciseKnowledgeError";
import type { ExerciseKnowledgeRepository } from "./ExerciseKnowledgeRepository";

/**
 * Ephemeral in-process ExerciseKnowledgeRepository.
 *
 * Suitable for tests and offline orchestration — not durable storage.
 * Read-only after seeding; returns immutable clones.
 */
export class InMemoryExerciseKnowledgeRepository
  implements ExerciseKnowledgeRepository
{
  private readonly definitions = new Map<string, ExerciseDefinition>();

  constructor(seed: readonly ExerciseDefinition[] = []) {
    if (seed.length > 0) {
      this.seed(seed);
    }
  }

  async loadAll(): Promise<readonly ExerciseDefinition[]> {
    return Object.freeze(
      [...this.definitions.values()].map((definition) =>
        freezeExerciseDefinition(definition),
      ),
    );
  }

  async findById(id: string): Promise<ExerciseDefinition | null> {
    const definition = this.definitions.get(id);
    return definition ? freezeExerciseDefinition(definition) : null;
  }

  async findByTag(
    tag: ExerciseTagCode | string,
  ): Promise<readonly ExerciseDefinition[]> {
    const matches = [...this.definitions.values()].filter((definition) =>
      definition.metadata.tags.some((entry) => entry.code === tag),
    );
    return Object.freeze(
      matches.map((definition) => freezeExerciseDefinition(definition)),
    );
  }

  async findByMovementPattern(
    pattern: MovementPatternCode,
  ): Promise<readonly ExerciseDefinition[]> {
    const matches = [...this.definitions.values()].filter(
      (definition) => definition.movementPattern.code === pattern,
    );
    return Object.freeze(
      matches.map((definition) => freezeExerciseDefinition(definition)),
    );
  }

  async findByEquipment(
    equipment: EquipmentCode,
  ): Promise<readonly ExerciseDefinition[]> {
    const matches = [...this.definitions.values()].filter((definition) =>
      definition.equipment.some((entry) => entry.equipment === equipment),
    );
    return Object.freeze(
      matches.map((definition) => freezeExerciseDefinition(definition)),
    );
  }

  /** Test / bootstrap helper — replace store synchronously. */
  seed(definitions: readonly ExerciseDefinition[]): void {
    this.definitions.clear();
    for (const definition of definitions) {
      const issues = validateExerciseDefinition(definition);
      if (issues.length > 0) {
        throw new ExerciseKnowledgeError(
          "invalid_definition",
          `Invalid exercise definition: ${issues.join(",")}`,
          { exerciseId: definition.id, issues },
        );
      }
      this.definitions.set(definition.id, freezeExerciseDefinition(definition));
    }
  }
}
