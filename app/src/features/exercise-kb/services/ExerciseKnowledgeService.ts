import type { EquipmentCode } from "../models/EquipmentRequirement";
import type { ExerciseDefinition } from "../models/ExerciseDefinition";
import { ExerciseKnowledgeError } from "../models/ExerciseKnowledgeError";
import type { ExerciseKnowledgeResult } from "../models/ExerciseKnowledgeResult";
import type { ExerciseRelationship } from "../models/ExerciseRelationship";
import type { ExerciseRelationshipKind } from "../models/ExerciseRelationship";
import type { MovementPatternCode } from "../models/MovementPattern";
import type { ExerciseTagCode } from "../models/ExerciseTag";
import type { ExerciseKnowledgeRepository } from "../repository/ExerciseKnowledgeRepository";
import { freezeExerciseDefinition } from "../utils/freezeExerciseDefinition";
import { rankAlternatives } from "../utils/rankAlternatives";
import { validateExerciseDefinition } from "../validators/validateExerciseDefinition";

export interface ExerciseSearchCriteria {
  readonly query?: string;
  readonly tag?: ExerciseTagCode | string;
  readonly movementPattern?: MovementPatternCode;
  readonly equipment?: EquipmentCode;
  readonly limit?: number;
}

/**
 * Read-only domain service for exercise knowledge queries.
 *
 * Resolves relationships and alternatives. Never contains workout logic.
 */
export class ExerciseKnowledgeService {
  constructor(private readonly repository: ExerciseKnowledgeRepository) {}

  async queryAll(): Promise<ExerciseKnowledgeResult> {
    const exercises = await this.repository.loadAll();
    return this.toResult(exercises);
  }

  async queryById(id: string): Promise<ExerciseDefinition | null> {
    const definition = await this.repository.findById(id);
    return definition ? freezeExerciseDefinition(definition) : null;
  }

  async search(
    criteria: ExerciseSearchCriteria = {},
  ): Promise<ExerciseKnowledgeResult> {
    let exercises = await this.repository.loadAll();

    if (criteria.tag) {
      exercises = await this.repository.findByTag(criteria.tag);
    }

    if (criteria.movementPattern) {
      const byPattern = await this.repository.findByMovementPattern(
        criteria.movementPattern,
      );
      const ids = new Set(byPattern.map((entry) => entry.id));
      exercises = exercises.filter((entry) => ids.has(entry.id));
    }

    if (criteria.equipment) {
      const byEquipment = await this.repository.findByEquipment(
        criteria.equipment,
      );
      const ids = new Set(byEquipment.map((entry) => entry.id));
      exercises = exercises.filter((entry) => ids.has(entry.id));
    }

    if (criteria.query && criteria.query.trim().length > 0) {
      const needle = criteria.query.trim().toLowerCase();
      exercises = exercises.filter(
        (entry) =>
          entry.name.toLowerCase().includes(needle) ||
          entry.id.toLowerCase().includes(needle),
      );
    }

    if (
      typeof criteria.limit === "number" &&
      Number.isInteger(criteria.limit) &&
      criteria.limit >= 0
    ) {
      exercises = exercises.slice(0, criteria.limit);
    }

    return this.toResult(exercises);
  }

  /**
   * Resolve all relationship edges for an exercise, returning target definitions.
   */
  async resolveRelationships(
    exerciseId: string,
    kind?: ExerciseRelationshipKind,
  ): Promise<readonly ExerciseDefinition[]> {
    const source = await this.requireDefinition(exerciseId);
    const edges = kind
      ? source.relationships.filter((edge) => edge.kind === kind)
      : source.relationships;

    return this.resolveTargets(edges);
  }

  async resolveAlternatives(
    exerciseId: string,
  ): Promise<readonly ExerciseDefinition[]> {
    const source = await this.requireDefinition(exerciseId);
    const candidates = await this.repository.loadAll();
    const ranked = rankAlternatives(
      source,
      candidates,
      source.relationships,
    );
    return Object.freeze(ranked.map((entry) => entry.exercise));
  }

  async resolveProgressions(
    exerciseId: string,
  ): Promise<readonly ExerciseDefinition[]> {
    return this.resolveRelationships(exerciseId, "progression");
  }

  async resolveRegressions(
    exerciseId: string,
  ): Promise<readonly ExerciseDefinition[]> {
    return this.resolveRelationships(exerciseId, "regression");
  }

  validate(definition: ExerciseDefinition): readonly string[] {
    return validateExerciseDefinition(definition);
  }

  private async requireDefinition(
    exerciseId: string,
  ): Promise<ExerciseDefinition> {
    const definition = await this.repository.findById(exerciseId);
    if (!definition) {
      throw new ExerciseKnowledgeError(
        "exercise_not_found",
        `Exercise definition not found: ${exerciseId}`,
        { exerciseId },
      );
    }
    return freezeExerciseDefinition(definition);
  }

  private async resolveTargets(
    edges: readonly ExerciseRelationship[],
  ): Promise<readonly ExerciseDefinition[]> {
    const resolved: ExerciseDefinition[] = [];
    for (const edge of edges) {
      const target = await this.repository.findById(edge.targetExerciseId);
      if (target) {
        resolved.push(freezeExerciseDefinition(target));
      }
    }
    return Object.freeze(resolved);
  }

  private toResult(
    exercises: readonly ExerciseDefinition[],
  ): ExerciseKnowledgeResult {
    const frozen = Object.freeze(
      exercises.map((definition) => freezeExerciseDefinition(definition)),
    );
    const issues = Object.freeze(
      frozen.flatMap((definition) => [
        ...validateExerciseDefinition(definition),
      ]),
    );

    return Object.freeze({
      exercises: frozen,
      validationIssues: Object.freeze([...new Set(issues)]),
      queriedAt: new Date().toISOString(),
    });
  }
}
