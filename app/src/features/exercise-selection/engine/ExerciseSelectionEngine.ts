import type { ExerciseDefinition } from "../../exercise-kb/models/ExerciseDefinition";
import type { ExerciseKnowledgeService } from "../../exercise-kb/services/ExerciseKnowledgeService";
import type { CandidateExercise } from "../models/CandidateExercise";
import type { ExerciseCandidateGroup } from "../models/ExerciseCandidateGroup";
import { ExerciseSelectionError } from "../models/ExerciseSelectionError";
import type { ExerciseSelectionRequest } from "../models/ExerciseSelectionRequest";
import type { ExerciseSelectionResult } from "../models/ExerciseSelectionResult";
import type { RejectedExercise } from "../models/RejectedExercise";
import type { SelectionExplanation } from "../models/SelectionExplanation";
import type { SelectionReason } from "../models/SelectionReason";
import type { ExerciseRoleSelector } from "../selectors/ExerciseRoleSelector";
import { createDefaultSelectors } from "../selectors";
import type { SelectionStrategy } from "../strategies/SelectionStrategy";
import { createDefaultStrategies } from "../strategies";
import { buildSelectionContext } from "../utils/buildSelectionContext";
import {
  mergeScoreParts,
  type SelectionScoreParts,
} from "../utils/calculateSelectionScore";
import { freezeSelectionResult } from "../utils/freezeSelectionResult";
import type { RankableCandidate } from "../utils/rankCandidates";
import { sortByIdAsc } from "../utils/sortDeterministically";
import { validateBlueprintCompatibility } from "../validators/validateBlueprintCompatibility";
import { validateSelectionResult } from "../validators";

/**
 * Deterministic Exercise Selection Engine.
 *
 * Consumes a Workout Blueprint + Exercise Knowledge Base and produces
 * ranked Workout Exercise Candidates. Never randomizes. Never programs
 * sets, reps, RPE, volume, progression, or fatigue.
 */
export class ExerciseSelectionEngine {
  constructor(
    private readonly knowledgeService: ExerciseKnowledgeService,
    private readonly strategies: readonly SelectionStrategy[] = createDefaultStrategies(),
    private readonly selectors: readonly ExerciseRoleSelector[] = createDefaultSelectors(),
  ) {}

  async select(
    request: ExerciseSelectionRequest,
  ): Promise<ExerciseSelectionResult> {
    const compatibilityIssues = validateBlueprintCompatibility(request);
    if (compatibilityIssues.length > 0) {
      throw new ExerciseSelectionError(
        "incompatible_blueprint",
        `Blueprint incompatible with selection: ${compatibilityIssues.join(",")}`,
        { issues: compatibilityIssues },
      );
    }

    const context = buildSelectionContext(request);
    const catalog = await this.loadCatalog();
    const { scored, rejected } = this.applyStrategies(catalog, context);

    const groups = this.applySelectors(scored, context);
    const candidates = this.flattenGroups(groups);
    const explanations =
      request.includeExplanations === false
        ? Object.freeze([] as SelectionExplanation[])
        : this.buildExplanations(candidates);

    const validationIssues = validateSelectionResult(
      request,
      context,
      candidates,
    );

    const requestId = this.buildRequestId(context);

    return freezeSelectionResult({
      requestId,
      context,
      groups,
      candidates,
      rejected,
      explanations,
      validationIssues,
      selectedAt: FIXED_SELECTION_TIMESTAMP,
    });
  }

  /**
   * Preview scored candidates without role grouping limits applied beyond
   * the engine's scored pool (still deterministic).
   */
  async preview(
    request: ExerciseSelectionRequest,
  ): Promise<ExerciseSelectionResult> {
    return this.select({
      ...request,
      maxCandidatesPerRole:
        request.maxCandidatesPerRole ?? PREVIEW_MAX_CANDIDATES_PER_ROLE,
      includeExplanations: request.includeExplanations ?? true,
    });
  }

  /**
   * Return explanations for a prior selection result (or recompute).
   */
  explain(result: ExerciseSelectionResult): readonly SelectionExplanation[] {
    if (result.explanations.length > 0) {
      return result.explanations;
    }
    return this.buildExplanations(result.candidates);
  }

  private async loadCatalog(): Promise<readonly ExerciseDefinition[]> {
    const knowledge = await this.knowledgeService.queryAll();
    return sortByIdAsc(knowledge.exercises);
  }

  private applyStrategies(
    catalog: readonly ExerciseDefinition[],
    context: ReturnType<typeof buildSelectionContext>,
  ): {
    readonly scored: readonly RankableCandidate[];
    readonly rejected: readonly RejectedExercise[];
  } {
    const byId = new Map(
      catalog.map((exercise) => [exercise.id, exercise] as const),
    );
    const rejectionReasons = new Map<string, SelectionReason[]>();
    const scorePartsById = new Map<string, SelectionScoreParts[]>();
    const reasonsById = new Map<string, SelectionReason[]>();

    for (const exercise of catalog) {
      scorePartsById.set(exercise.id, []);
      reasonsById.set(exercise.id, []);
    }

    for (const strategy of this.strategies) {
      const evaluations = strategy.evaluate(catalog, context);
      for (const evaluation of evaluations) {
        if (!byId.has(evaluation.exerciseId)) {
          continue;
        }

        if (!evaluation.accepted) {
          const existing = rejectionReasons.get(evaluation.exerciseId) ?? [];
          existing.push(...evaluation.reasons);
          rejectionReasons.set(evaluation.exerciseId, existing);
          continue;
        }

        if (rejectionReasons.has(evaluation.exerciseId)) {
          continue;
        }

        const parts = scorePartsById.get(evaluation.exerciseId);
        const reasons = reasonsById.get(evaluation.exerciseId);
        if (parts && reasons) {
          parts.push(evaluation.scoreParts);
          reasons.push(...evaluation.reasons);
        }
      }
    }

    const rejected: RejectedExercise[] = [];
    for (const [exerciseId, reasons] of [...rejectionReasons.entries()].sort(
      ([left], [right]) => left.localeCompare(right),
    )) {
      rejected.push(
        Object.freeze({
          exerciseId,
          exercise: byId.get(exerciseId) ?? null,
          reasons: Object.freeze([...reasons]),
        }),
      );
    }

    const scored: RankableCandidate[] = [];
    for (const exercise of catalog) {
      if (rejectionReasons.has(exercise.id)) {
        continue;
      }
      const parts = scorePartsById.get(exercise.id) ?? [];
      const reasons = reasonsById.get(exercise.id) ?? [];
      scored.push(
        Object.freeze({
          exerciseId: exercise.id,
          exercise,
          score: mergeScoreParts(...parts),
          reasons: Object.freeze([...reasons]),
        }),
      );
    }

    return {
      scored: Object.freeze(scored),
      rejected: Object.freeze(rejected),
    };
  }

  private applySelectors(
    scored: readonly RankableCandidate[],
    context: ReturnType<typeof buildSelectionContext>,
  ): readonly ExerciseCandidateGroup[] {
    const usedIds = new Set<string>();
    const groups: ExerciseCandidateGroup[] = [];

    for (const selector of this.selectors) {
      const available = scored.filter(
        (candidate) => !usedIds.has(candidate.exerciseId),
      );
      const selected = selector.select(available, context);
      for (const candidate of selected) {
        usedIds.add(candidate.exerciseId);
      }
      groups.push(
        Object.freeze({
          role: selector.role,
          candidates: selected,
        }),
      );
    }

    return Object.freeze(groups);
  }

  private flattenGroups(
    groups: readonly ExerciseCandidateGroup[],
  ): readonly CandidateExercise[] {
    return Object.freeze(groups.flatMap((group) => [...group.candidates]));
  }

  private buildExplanations(
    candidates: readonly CandidateExercise[],
  ): readonly SelectionExplanation[] {
    return Object.freeze(
      candidates.map((candidate) =>
        Object.freeze({
          exerciseId: candidate.exerciseId,
          role: candidate.role,
          summaryCode: `selected_as_${candidate.role}`,
          reasons: candidate.reasons,
          score: candidate.score,
        }),
      ),
    );
  }

  private buildRequestId(
    context: ReturnType<typeof buildSelectionContext>,
  ): string {
    return `selection:${context.blueprintId}:${context.dayId}`;
  }
}

/** Fixed timestamp keeps selection results deterministic across runs. */
export const FIXED_SELECTION_TIMESTAMP = "2026-07-22T12:00:00.000Z";

const PREVIEW_MAX_CANDIDATES_PER_ROLE = 5;
