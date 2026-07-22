import type { ConversationAudience } from "../models/ConversationAudience";
import { ConversationAudiences } from "../models/ConversationAudience";
import type { ConversationContext } from "../models/ConversationContext";
import type { ConversationEngineResult } from "../models/ConversationEngineResult";
import { ConversationEngineError } from "../models/ConversationEngineError";
import type { ConversationIntent } from "../models/ConversationIntent";
import { ConversationIntents } from "../models/ConversationIntent";
import type { ConversationMessage } from "../models/ConversationMessage";
import type { ConversationPreparationInput } from "../models/ConversationPreparationInput";
import type { ConversationSnapshot } from "../models/ConversationSnapshot";
import type { ConversationStage } from "../models/ConversationStage";
import { ConversationStages } from "../models/ConversationStage";
import type { ConversationState } from "../models/ConversationState";
import { ConversationStates } from "../models/ConversationState";
import type { ConversationSummary } from "../models/ConversationSummary";
import type { ConversationTurn } from "../models/ConversationTurn";
import { ConversationContextBuilder } from "../builders/ConversationContextBuilder";
import { ConversationRequestBuilder } from "../builders/ConversationRequestBuilder";
import { ConversationSummaryBuilder } from "../builders/ConversationSummaryBuilder";
import {
  ConstraintSelector,
  createConstraintSelector,
  createEvidenceSelector,
  createGoalSelector,
  createKnowledgeSelector,
  createPrioritySelector,
  createSessionSelector,
  EvidenceSelector,
  GoalSelector,
  KnowledgeSelector,
  PrioritySelector,
  SessionSelector,
} from "../selectors";
import {
  freezeEngineResult,
  freezeMessage,
  freezeSnapshot,
  freezeTurn,
} from "../utils/freezeContext";
import {
  normalizeConstraintPriorities,
  normalizeEvidencePriorities,
  normalizeGoalPriorities,
  normalizeMessagePriorities,
  normalizeTurnPriorities,
} from "../utils/normalizePriorities";
import {
  sortConstraints,
  sortEvidence,
  sortGoals,
  sortMessages,
  sortTurns,
} from "../utils/sortEvidence";
import { buildConversationSummary } from "../utils/summarizeContext";
import {
  validateMissingInformation,
  validatePreparationInput,
  validateSnapshotIntegrity,
} from "../validators";

const DEFAULT_PREPARED_AT = "2026-07-23T00:00:00.000Z";

export interface ConversationOrchestratorEngineDeps {
  readonly knowledgeSelector?: KnowledgeSelector;
  readonly prioritySelector?: PrioritySelector;
  readonly goalSelector?: GoalSelector;
  readonly evidenceSelector?: EvidenceSelector;
  readonly constraintSelector?: ConstraintSelector;
  readonly sessionSelector?: SessionSelector;
}

/**
 * Conversation Orchestrator Engine — prepares Conversation Context from Coaching Context.
 *
 * Consumes CoachingContext (+ optional Insight/Recovery/History/Performance/Achievement).
 * Produces immutable ConversationContext only.
 *
 * No AI. No prompts. No LLM. No networking. No persistence. No conversation generation.
 * Never modifies upstream engines.
 */
export class ConversationOrchestratorEngine {
  private readonly knowledgeSelector: KnowledgeSelector;
  private readonly prioritySelector: PrioritySelector;
  private readonly goalSelector: GoalSelector;
  private readonly evidenceSelector: EvidenceSelector;
  private readonly constraintSelector: ConstraintSelector;
  private readonly sessionSelector: SessionSelector;

  constructor(deps: ConversationOrchestratorEngineDeps = {}) {
    this.knowledgeSelector =
      deps.knowledgeSelector ?? createKnowledgeSelector();
    this.prioritySelector = deps.prioritySelector ?? createPrioritySelector();
    this.goalSelector = deps.goalSelector ?? createGoalSelector();
    this.evidenceSelector = deps.evidenceSelector ?? createEvidenceSelector();
    this.constraintSelector =
      deps.constraintSelector ?? createConstraintSelector();
    this.sessionSelector = deps.sessionSelector ?? createSessionSelector();
  }

  /**
   * Prepare an immutable Conversation Context from a Coaching Context.
   */
  prepare(input: ConversationPreparationInput): ConversationEngineResult {
    if (!input.coachingContext) {
      throw new ConversationEngineError(
        "missing_coaching_context",
        "CoachingContext is required",
      );
    }

    const softIssues = [
      ...validatePreparationInput(input),
      ...validateMissingInformation(input),
    ];

    const preparedAt = input.preparedAt ?? DEFAULT_PREPARED_AT;
    const contextId =
      input.contextId ??
      `conversation:${input.coachingContext.id}:${preparedAt}`;
    const audience: ConversationAudience =
      input.audience ?? ConversationAudiences.ATHLETE;
    const state: ConversationState =
      input.state ?? ConversationStates.READY;
    const stage: ConversationStage =
      input.stage ?? ConversationStages.REQUEST_READY;

    const knowledgeSelection = this.knowledgeSelector.select(
      input.coachingContext,
    );
    const prioritySelection = this.prioritySelector.select(
      input.coachingContext.objectives,
    );

    const rankedObjectives = prioritySelection.rankedObjectiveIds
      .map((id) =>
        input.coachingContext.objectives.find(
          (objective) => objective.id === id,
        ),
      )
      .filter((objective): objective is NonNullable<typeof objective> =>
        Boolean(objective),
      );

    const evidence = normalizeEvidencePriorities(
      this.evidenceSelector.select({
        coachEvidence: input.coachingContext.evidence,
        rankedObjectives,
      }),
    );

    const goals = normalizeGoalPriorities(
      this.goalSelector.select({
        rankedObjectives,
        evidence,
      }),
    );

    const constraints = normalizeConstraintPriorities(
      sortConstraints(
        this.constraintSelector.select(input.coachingContext.constraints),
      ),
    );

    const session = this.sessionSelector.select({
      coachingContext: input.coachingContext,
      preparedAt,
      insightSnapshot: input.insightSnapshot,
      recoverySnapshot: input.recoverySnapshot,
      athleteHistory: input.athleteHistory,
      achievementResult: input.achievementResult,
      performanceSnapshot: input.performanceSnapshot,
    });

    const primaryIntent: ConversationIntent =
      goals[0]?.intent ?? ConversationIntents.FOCUS;

    const messages = normalizeMessagePriorities(
      sortMessages(this.buildStructuralMessages(goals, contextId)),
    );
    const turns = normalizeTurnPriorities(
      sortTurns(this.buildStructuralTurns(goals, messages)),
    );

    const request = new ConversationRequestBuilder()
      .withId(`conversation-request:${contextId}`)
      .withContextId(contextId)
      .withAudience(audience)
      .withPrimaryIntent(primaryIntent)
      .withGoalIds(goals.map((goal) => goal.id))
      .withConstraintIds(constraints.map((constraint) => constraint.id))
      .withEvidenceIds(evidence.map((item) => item.id))
      .withKnowledgeRefs(
        Object.freeze([
          knowledgeSelection.knowledge.coachingContextId,
          ...knowledgeSelection.selectedObjectiveIds,
        ]),
      )
      .withStatement(
        `Structured conversation request for ${goals.length} goal(s).`,
      )
      .withMetadata(
        Object.freeze({
          tags: Object.freeze(["conversation-request", "handoff"]),
          attributes: Object.freeze({
            coachingContextId: input.coachingContext.id,
          }),
        }),
      )
      .build();

    const responsePlaceholder = Object.freeze({
      id: `conversation-response-placeholder:${contextId}`,
      contextId,
      status: "reserved" as const,
      provider: null,
      content: null,
      reservedAt: preparedAt,
    });

    const missingInformation = softIssues.filter((issue) =>
      issue.startsWith("missing_"),
    );

    const preparation = Object.freeze({
      preparedAt,
      coachingContextId: input.coachingContext.id,
      selectorNames: Object.freeze([
        "KnowledgeSelector",
        "PrioritySelector",
        "GoalSelector",
        "EvidenceSelector",
        "ConstraintSelector",
        "SessionSelector",
      ]),
      goalCount: goals.length,
      constraintCount: constraints.length,
      evidenceCount: evidence.length,
      turnCount: turns.length,
      messageCount: messages.length,
      missingInformation: Object.freeze([...missingInformation]),
    });

    const summary = buildConversationSummary({
      contextId,
      athleteId: session.athleteId,
      goals,
      constraintCount: constraints.length,
      evidenceCount: evidence.length,
      turnCount: turns.length,
      messageCount: messages.length,
      state,
      stage,
    });

    const context = new ConversationContextBuilder()
      .withId(contextId)
      .withSession(session)
      .withAudience(audience)
      .withState(state)
      .withStage(stage)
      .withIntent(primaryIntent)
      .withGoals(sortGoals(goals))
      .withConstraints(constraints)
      .withEvidence(sortEvidence(evidence))
      .withKnowledge(knowledgeSelection.knowledge)
      .withMessages(messages)
      .withTurns(turns)
      .withRequest(request)
      .withResponsePlaceholder(responsePlaceholder)
      .withPreparation(preparation)
      .withMetadata(
        Object.freeze({
          tags: Object.freeze(["conversation-orchestrator", "foundation"]),
          attributes: Object.freeze({
            coachingContextId: input.coachingContext.id,
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
   * Create a ConversationSnapshot from an existing ConversationContext.
   */
  createSnapshot(
    context: ConversationContext,
    options: {
      readonly snapshotId?: string;
      readonly frozenAt?: string;
      readonly summary?: ConversationSummary;
    } = {},
  ): ConversationSnapshot {
    const frozenAt = options.frozenAt ?? context.frozenAt;
    const snapshotId = options.snapshotId ?? context.id;
    const summary =
      options.summary ??
      (context.summary.contextId === snapshotId
        ? context.summary
        : new ConversationSummaryBuilder()
            .withIds({
              contextId: snapshotId,
              athleteId: context.session.athleteId,
            })
            .withGoalCount(context.goals.length)
            .withConstraintCount(context.constraints.length)
            .withEvidenceCount(context.evidence.length)
            .withTurnCount(context.turns.length)
            .withMessageCount(context.messages.length)
            .withTopGoalIds(context.summary.topGoalIds)
            .withPrimaryIntent(context.summary.primaryIntent)
            .withState(context.state)
            .withStage(context.stage)
            .withSummaryText(context.summary.summaryText)
            .build());

    const alignedContext =
      context.id === snapshotId && context.summary.contextId === snapshotId
        ? context
        : new ConversationContextBuilder()
            .withId(snapshotId)
            .withSession(context.session)
            .withAudience(context.audience)
            .withState(context.state)
            .withStage(context.stage)
            .withIntent(context.intent)
            .withGoals(context.goals)
            .withConstraints(context.constraints)
            .withEvidence(context.evidence)
            .withKnowledge(context.knowledge)
            .withMessages(context.messages)
            .withTurns(context.turns)
            .withRequest(context.request)
            .withResponsePlaceholder(context.responsePlaceholder)
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
   * Summarize a conversation context or snapshot.
   */
  summarize(
    contextOrSnapshot: ConversationContext | ConversationSnapshot,
  ): ConversationSummary {
    if ("context" in contextOrSnapshot && "summary" in contextOrSnapshot) {
      return contextOrSnapshot.summary;
    }
    return contextOrSnapshot.summary;
  }

  /**
   * Structural message placeholders derived from goals — not AI dialogue.
   */
  private buildStructuralMessages(
    goals: readonly {
      readonly id: string;
      readonly intent: ConversationIntent;
      readonly priority: number;
      readonly statement: string;
      readonly evidenceIds: readonly string[];
    }[],
    contextId: string,
  ): readonly ConversationMessage[] {
    return goals.slice(0, 3).map((goal, index) =>
      freezeMessage({
        id: `conversation-message:${contextId}:${index}`,
        role: "orchestrator",
        code: `prepare_goal_${goal.intent}`,
        statement: `Orchestration placeholder for goal ${goal.id}.`,
        priority: goal.priority,
        goalIds: Object.freeze([goal.id]),
        evidenceIds: Object.freeze([...goal.evidenceIds]),
        metadata: Object.freeze({
          tags: Object.freeze(["structural", "placeholder"]),
          attributes: Object.freeze({
            goalId: goal.id,
            intent: goal.intent,
          }),
        }),
      }),
    );
  }

  /**
   * Structural turns sequencing goals — not generated conversation.
   */
  private buildStructuralTurns(
    goals: readonly {
      readonly id: string;
      readonly intent: ConversationIntent;
      readonly priority: number;
      readonly statement: string;
    }[],
    messages: readonly ConversationMessage[],
  ): readonly ConversationTurn[] {
    return goals.slice(0, 3).map((goal, index) => {
      const messageIds = messages
        .filter((message) => message.goalIds.includes(goal.id))
        .map((message) => message.id);

      return freezeTurn({
        id: `conversation-turn:${goal.id}`,
        index,
        intent: goal.intent,
        priority: goal.priority,
        goalIds: Object.freeze([goal.id]),
        messageIds: Object.freeze([...messageIds]),
        statement: `Turn ${index} addresses goal ${goal.id}.`,
      });
    });
  }
}

export function createConversationOrchestratorEngine(
  deps?: ConversationOrchestratorEngineDeps,
): ConversationOrchestratorEngine {
  return new ConversationOrchestratorEngine(deps);
}
