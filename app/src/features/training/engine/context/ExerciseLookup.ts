import type { ExerciseDefinition } from "../../models/ExerciseDefinition";
import type { ExerciseId } from "../../types/ids";

/**
 * Single canonical `ExerciseId` -> `ExerciseDefinition` lookup shared by
 * every planner in the engine pipeline.
 *
 * Before this type existed, `RuleBasedProgramGenerator`,
 * `RuleBasedVolumePlanner`, and `RuleBasedProgressionPlanner` each built
 * their own copy of this same map from the same `exerciseCatalogue`,
 * risking divergence if any one of them changed how it built or read
 * that map. `ExerciseLookup` is built exactly once per `generateProgram`
 * pass — by `RuleBasedProgramGenerator`, via `createExerciseLookup` — and
 * threaded through `PlanningContext` to every planner from there; no
 * planner constructs, owns, or caches its own copy.
 *
 * Deliberately narrower than `ReadonlyMap`: exposing only `get` and
 * `values` (rather than the full `Map` surface, or the catalogue array
 * itself) keeps every consumer's dependency limited to "resolve an id to
 * its definition, or list every definition", which is all any planner
 * here actually needs. Being an interface rather than a concrete
 * collection type also means any implementation (map-backed, index-
 * backed, lazily resolved, etc.) can stand behind it without touching a
 * single consumer (Dependency Inversion, Open/Closed).
 */
export interface ExerciseLookup {
  /** Resolves the exercise with `id`, or `undefined` if the lookup has none. */
  get(id: ExerciseId): ExerciseDefinition | undefined;
  /** Every exercise definition in the lookup, in catalogue order. */
  values(): readonly ExerciseDefinition[];
}

/**
 * Builds an `ExerciseLookup` from a resolved exercise catalogue.
 *
 * Pure and deterministic: the same catalogue array always produces a
 * lookup with identical contents, the returned instance is frozen and
 * never mutates after construction, and building it performs no I/O,
 * randomness, or persistence of its own — it only indexes the catalogue
 * it is given.
 */
export function createExerciseLookup(catalogue: readonly ExerciseDefinition[]): ExerciseLookup {
  const byId = new Map(catalogue.map((exercise) => [exercise.id, exercise]));
  const allExercises: readonly ExerciseDefinition[] = Object.freeze([...catalogue]);

  return Object.freeze({
    get: (id: ExerciseId): ExerciseDefinition | undefined => byId.get(id),
    values: (): readonly ExerciseDefinition[] => allExercises,
  });
}
