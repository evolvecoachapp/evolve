import type { EquipmentCode } from "../models/EquipmentRequirement";
import type { ExerciseDefinition } from "../models/ExerciseDefinition";
import type { MovementPatternCode } from "../models/MovementPattern";
import type { ExerciseTagCode } from "../models/ExerciseTag";

/**
 * Read-only persistence boundary for ExerciseDefinition knowledge.
 *
 * No durable storage in this sprint — in-memory only.
 * Implementations must return immutable objects.
 */
export interface ExerciseKnowledgeRepository {
  loadAll(): Promise<readonly ExerciseDefinition[]>;
  findById(id: string): Promise<ExerciseDefinition | null>;
  findByTag(tag: ExerciseTagCode | string): Promise<readonly ExerciseDefinition[]>;
  findByMovementPattern(
    pattern: MovementPatternCode,
  ): Promise<readonly ExerciseDefinition[]>;
  findByEquipment(
    equipment: EquipmentCode,
  ): Promise<readonly ExerciseDefinition[]>;
}
