import type { CoachAudience } from "../models/CoachAudience";
import { CoachAudiences } from "../models/CoachAudience";
import type { CoachCommunicationStyle } from "../models/CoachCommunicationStyle";
import { CoachCommunicationStyles } from "../models/CoachCommunicationStyle";
import type { CoachContextSnapshot } from "../models/CoachContextSnapshot";
import type { CoachEngineResult } from "../models/CoachEngineResult";
import { CoachEngineError } from "../models/CoachEngineError";
import type { CoachPreparationInput } from "../models/CoachPreparationInput";
import type { CoachSession } from "../models/CoachSession";
import type { CoachingContext } from "../models/CoachingContext";
import type { CoachingContextSummary } from "../models/CoachingContextSummary";
import { CoachInstructionBuilder } from "../builders/CoachInstructionBuilder";
import { CoachSummaryBuilder } from "../builders/CoachSummaryBuilder";
import { CoachingContextBuilder } from "../builders/CoachingContextBuilder";
import {
  createEvidenceSelector,
  createHistorySelector,
  createInsightSelector,
  createObjectiveSelector,
  createPrioritySelector,
  createRecoverySelector,
  EvidenceSelector,
  HistorySelector,
  InsightSelector,
  ObjectiveSelector,
  PrioritySelector,
  RecoverySelector,
} from "../selectors";
import { aggregateKnowledge } from "../utils/aggregateKnowledge";
import { freezeEngineResult, freezeSnapshot } from "../utils/freezeContext";
import {
  normalizeConstraintPriorities,
  normalizeEvidencePriorities,
  normalizeFocusPriorities,
  normalizeInstructionPriorities,
  normalizeObjectivePriorities,
} from "../utils/normalizePriorities";
import {
  sortConstraints,
  sortEvidence,
  sortFocus,
  sortInstructions,
  sortObjectives,
} from "../utils/sortEvidence";
import { buildCoachingContextSummary } from "../utils/summarizeContext";
import {
  validateMissingInformation,
  validatePreparationInput,
  validateSnapshotIntegrity,
} from "../validators";

const DEFAULT_PREPARED_AT = "2026-07-23T00:00:00.000Z";

export interface CoachIntelligenceEngineDeps {
  readonly insightSelector?: InsightSelector;
  readonly prioritySelector?: PrioritySelector;
  readonly evidenceSelector?: EvidenceSelector;
  readonly recoverySelector?: RecoverySelector;
  readonly historySelector?: HistorySelector;
  readonly objectiveSelector?: ObjectiveSelector;
}

/**
 * Coach Intelligence Engine — transforms domain knowledge into Coaching Context.
 *
 * Consumes InsightSnapshot (+ optional Recovery/History/Performance/Achievement).
 * Produces immutable CoachingContext only.
 *
 * No AI. No prompts. No LLM. No networking. No persistence. No conversation.
 * Never modifies upstream engines.
 */
export class CoachIntelligenceEngine {
  private readonly insightSelector: InsightSelector;
  private readonly prioritySelector: PrioritySelector;
  private readonly evidenceSelector: EvidenceSelector;
  private readonly recoverySelector: RecoverySelector;
  private readonly historySelector: HistorySelector;
  private readonly objectiveSelector: ObjectiveSelector;

  constructor(deps: CoachIntelligenceEngineDeps = {}) {
    this.insightSelector = deps.insightSelector ?? createInsightSelector();
    this.prioritySelector = deps.prioritySelector ?? createPrioritySelector();
    this.evidenceSelector = deps.evidenceSelector ?? createEvidenceSelector();
    this.recoverySelector = deps.recoverySelector ?? createRecoverySelector();
    this.historySelector = deps.historySelector ?? createHistorySelector();
    this.objectiveSelector =
      deps.objectiveSelector ?? createObjectiveSelector();
  }

  /**
   * Prepare an immutable Coaching Context from an Insight Snapshot.
   */
  prepare(input: CoachPreparationInput): CoachEngineResult {
    if (!input.insightSnapshot) {
      throw new CoachEngineError(
        "missing_insight_snapshot",
        "InsightSnapshot is required",
      );
    }

    const softIssues = [
      ...validatePreparationInput(input),
      ...validateMissingInformation(input),
    ];

    const preparedAt = input.preparedAt ?? DEFAULT_PREPARED_AT;
    const contextId =
      input.contextId ??
      `coach:${input.insightSnapshot.id}:${preparedAt}`;
    const audience: CoachAudience =
      input.audience ?? CoachAudiences.ATHLETE;
    const communicationStyle: CoachCommunicationStyle =
      input.communicationStyle ?? CoachCommunicationStyles.DIRECT;

    const insightSelection = this.insightSelector.select(input.insightSnapshot);
    const prioritySelection = this.prioritySelector.select(
      insightSelection.selectedInsights,
    );

    const rankedInsights = prioritySelection.rankedInsightIds
      .map((id) =>
        insightSelection.selectedInsights.find((insight) => insight.id === id),
      )
      .filter((insight): insight is NonNullable<typeof insight> =>
        Boolean(insight),
      );

    const evidence = normalizeEvidencePriorities(
      this.evidenceSelector.select(rankedInsights),
    );
    const recoverySelection = this.recoverySelector.select(
      input.recoverySnapshot,
    );
    const historySelection = this.historySelector.select(input.athleteHistory);

    const focusFromInsights = rankedInsights.slice(0, 3).map((insight) =>
      Object.freeze({
        id: `coach-focus:insight:${insight.id}`,
        area: insight.type,
        statement: insight.statement,
        priority: insight.priority,
        insightIds: Object.freeze([insight.id]),
        reason: Object.freeze({
          code: "insight_focus",
          statement: "Selected from InsightSnapshot",
          attributes: Object.freeze({
            insightId: insight.id,
            insightType: insight.type,
          }),
        }),
      }),
    );

    const focus = normalizeFocusPriorities(
      sortFocus([...focusFromInsights, ...historySelection.focus]),
    );

    const objectives = normalizeObjectivePriorities(
      this.objectiveSelector.select({
        rankedInsights,
        evidence,
        focus,
      }),
    );

    const constraints = normalizeConstraintPriorities(
      sortConstraints(recoverySelection.constraints),
    );

    const instructions = normalizeInstructionPriorities(
      sortInstructions(
        objectives.map((objective) =>
          new CoachInstructionBuilder()
            .withId(`coach-instruction:${objective.id}`)
            .withCode(`follow_objective_${objective.intent}`)
            .withObjectiveId(objective.id)
            .withStatement(
              `Address objective ${objective.id} with intent ${objective.intent}.`,
            )
            .withPriority(objective.priority)
            .withReason(
              Object.freeze({
                code: "objective_instruction",
                statement: "Structured instruction derived from objective",
                attributes: Object.freeze({
                  objectiveId: objective.id,
                  intent: objective.intent,
                }),
              }),
            )
            .withEvidenceIds(objective.evidenceIds)
            .build(),
        ),
      ),
    );

    const knowledge = aggregateKnowledge({
      insightIds: insightSelection.allInsightIds,
      selectedInsightIds: insightSelection.selectedInsightIds,
      recoveryReferenced: recoverySelection.referenced,
      historyReferenced: historySelection.referenced,
      performanceReferenced: Boolean(input.performanceSnapshot),
      achievementReferenced: Boolean(input.achievementResult),
      attributes: Object.freeze({
        rankedCount: rankedInsights.length,
      }),
    });

    const missingInformation = softIssues.filter((issue) =>
      issue.startsWith("missing_"),
    );

    const preparation = Object.freeze({
      preparedAt,
      insightSnapshotId: input.insightSnapshot.id,
      selectorNames: Object.freeze([
        "InsightSelector",
        "PrioritySelector",
        "EvidenceSelector",
        "RecoverySelector",
        "HistorySelector",
        "ObjectiveSelector",
      ]),
      objectiveCount: objectives.length,
      constraintCount: constraints.length,
      instructionCount: instructions.length,
      evidenceCount: evidence.length,
      missingInformation: Object.freeze([...missingInformation]),
    });

    const session = this.buildSession(input, preparedAt);

    const summary = buildCoachingContextSummary({
      contextId,
      athleteId: session.athleteId,
      objectives,
      constraintCount: constraints.length,
      instructionCount: instructions.length,
      focusCount: focus.length,
      evidenceCount: evidence.length,
    });

    const context = new CoachingContextBuilder()
      .withId(contextId)
      .withSession(session)
      .withAudience(audience)
      .withCommunicationStyle(communicationStyle)
      .withObjectives(sortObjectives(objectives))
      .withConstraints(constraints)
      .withInstructions(instructions)
      .withFocus(focus)
      .withEvidence(sortEvidence(evidence))
      .withKnowledge(knowledge)
      .withPreparation(preparation)
      .withMetadata(
        Object.freeze({
          tags: Object.freeze(["coach-intelligence", "foundation"]),
          attributes: Object.freeze({
            insightSnapshotId: input.insightSnapshot.id,
          }),
        }),
      )
      .withSummary(summary)
      .withFrozenAt(preparedAt)
      .build();

    const snapshot = freezeSnapshot({
      id: contextId,
      context,
      summary,
      frozenAt: preparedAt,
    });

    softIssues.push(...validateSnapshotIntegrity(snapshot));

    return freezeEngineResult({
      snapshot,
      context,
      summary,
      validationIssues: Object.freeze([...new Set(softIssues)]),
    });
  }

  /**
   * Create a CoachContextSnapshot from an existing CoachingContext.
   */
  createSnapshot(
    context: CoachingContext,
    options: {
      readonly snapshotId?: string;
      readonly frozenAt?: string;
      readonly summary?: CoachingContextSummary;
    } = {},
  ): CoachContextSnapshot {
    const frozenAt = options.frozenAt ?? context.frozenAt;
    const snapshotId = options.snapshotId ?? context.id;
    const summary =
      options.summary ??
      (context.summary.contextId === snapshotId
        ? context.summary
        : new CoachSummaryBuilder()
            .withIds({
              contextId: snapshotId,
              athleteId: context.session.athleteId,
            })
            .withObjectiveCount(context.objectives.length)
            .withConstraintCount(context.constraints.length)
            .withInstructionCount(context.instructions.length)
            .withFocusCount(context.focus.length)
            .withEvidenceCount(context.evidence.length)
            .withTopObjectiveIds(context.summary.topObjectiveIds)
            .withPrimaryIntent(context.summary.primaryIntent)
            .withSummaryText(context.summary.summaryText)
            .build());

    const alignedContext =
      context.id === snapshotId && context.summary.contextId === snapshotId
        ? context
        : new CoachingContextBuilder()
            .withId(snapshotId)
            .withSession(context.session)
            .withAudience(context.audience)
            .withCommunicationStyle(context.communicationStyle)
            .withObjectives(context.objectives)
            .withConstraints(context.constraints)
            .withInstructions(context.instructions)
            .withFocus(context.focus)
            .withEvidence(context.evidence)
            .withKnowledge(context.knowledge)
            .withPreparation(context.preparation)
            .withMetadata(context.metadata)
            .withSummary(summary)
            .withFrozenAt(frozenAt)
            .build();

    return freezeSnapshot({
      id: snapshotId,
      context: alignedContext,
      summary,
      frozenAt,
    });
  }

  /**
   * Summarize a coaching context or snapshot.
   */
  summarize(
    contextOrSnapshot: CoachingContext | CoachContextSnapshot,
  ): CoachingContextSummary {
    if ("context" in contextOrSnapshot && "summary" in contextOrSnapshot) {
      return contextOrSnapshot.summary;
    }
    return contextOrSnapshot.summary;
  }

  private buildSession(
    input: CoachPreparationInput,
    preparedAt: string,
  ): CoachSession {
    const insight = input.insightSnapshot;
    const recovery = input.recoverySnapshot;
    const history = input.athleteHistory;
    const performance = input.performanceSnapshot;
    const achievement = input.achievementResult;

    return Object.freeze({
      athleteId:
        insight.context.athleteId ??
        history?.athleteId ??
        performance?.context.athleteId ??
        recovery?.context.athleteId ??
        null,
      sessionId:
        insight.context.sessionId ??
        achievement?.sessionId ??
        performance?.session.sessionId ??
        recovery?.context.sessionId ??
        history?.context.sessionId ??
        null,
      runtimeId:
        insight.context.runtimeId ??
        achievement?.runtimeId ??
        performance?.session.runtimeId ??
        recovery?.context.runtimeId ??
        history?.context.runtimeId ??
        null,
      dayId:
        insight.context.dayId ??
        performance?.context.dayId ??
        recovery?.context.dayId ??
        history?.context.dayId ??
        null,
      weekNumber:
        insight.context.weekNumber ??
        performance?.context.weekNumber ??
        recovery?.context.weekNumber ??
        history?.context.weekNumber ??
        null,
      insightSnapshotId: insight.id,
      performanceSnapshotId:
        insight.context.performanceSnapshotId ?? performance?.id ?? null,
      achievementEvaluationId:
        insight.context.achievementEvaluationId ??
        achievement?.evaluationId ??
        null,
      recoverySnapshotId:
        insight.context.recoverySnapshotId ?? recovery?.id ?? null,
      historyId: insight.context.historyId ?? history?.id ?? null,
      preparedAt,
    });
  }
}

export function createCoachIntelligenceEngine(
  deps?: CoachIntelligenceEngineDeps,
): CoachIntelligenceEngine {
  return new CoachIntelligenceEngine(deps);
}
