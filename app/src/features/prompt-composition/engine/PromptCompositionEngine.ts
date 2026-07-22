import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import { PromptPackageBuilder } from "../builders/PromptPackageBuilder";
import { PromptSummaryBuilder } from "../builders/PromptSummaryBuilder";
import {
  ConstraintComposer,
  ConversationComposer,
  createConstraintComposer,
  createConversationComposer,
  createIdentityComposer,
  createKnowledgeComposer,
  createMemoryComposer,
  createSafetyComposer,
  createSummaryComposer,
  createSystemComposer,
  createUserInputComposer,
  IdentityComposer,
  KnowledgeComposer,
  MemoryComposer,
  SafetyComposer,
  SummaryComposer,
  SystemComposer,
  UserInputComposer,
} from "../composers";
import type { PromptCompositionInput } from "../models/PromptCompositionInput";
import type { PromptContext } from "../models/PromptContext";
import { PromptEngineError } from "../models/PromptEngineError";
import type { PromptEngineResult } from "../models/PromptEngineResult";
import type { PromptPackage } from "../models/PromptPackage";
import type { PromptSnapshot } from "../models/PromptSnapshot";
import type { PromptSummary } from "../models/PromptSummary";
import { aggregateSections } from "../utils/aggregateSections";
import {
  freezeEngineResult,
  freezeSnapshot,
} from "../utils/freezePackage";
import {
  normalizeBlockPriorities,
  normalizeInstructionPriorities,
} from "../utils/normalizePriorities";
import { sortBlocks, sortInstructions } from "../utils/sortBlocks";
import {
  validateCompositionInput,
  validateMissingInformation,
  validateSnapshotIntegrity,
} from "../validators";

const DEFAULT_COMPOSED_AT = "2026-07-23T00:00:00.000Z";

export interface PromptCompositionEngineDeps {
  readonly systemComposer?: SystemComposer;
  readonly identityComposer?: IdentityComposer;
  readonly knowledgeComposer?: KnowledgeComposer;
  readonly conversationComposer?: ConversationComposer;
  readonly memoryComposer?: MemoryComposer;
  readonly constraintComposer?: ConstraintComposer;
  readonly safetyComposer?: SafetyComposer;
  readonly userInputComposer?: UserInputComposer;
  readonly summaryComposer?: SummaryComposer;
}

/**
 * Prompt Composition Engine — transforms ConversationContext into PromptPackage.
 *
 * Produces immutable structured prompt blocks only.
 *
 * No AI. No networking. No HTTP. No OpenAI / Anthropic / Gemini / Ollama.
 * No provider-specific string prompt generation.
 * Never modifies upstream domains.
 */
export class PromptCompositionEngine {
  private readonly systemComposer: SystemComposer;
  private readonly identityComposer: IdentityComposer;
  private readonly knowledgeComposer: KnowledgeComposer;
  private readonly conversationComposer: ConversationComposer;
  private readonly memoryComposer: MemoryComposer;
  private readonly constraintComposer: ConstraintComposer;
  private readonly safetyComposer: SafetyComposer;
  private readonly userInputComposer: UserInputComposer;
  private readonly summaryComposer: SummaryComposer;

  constructor(deps: PromptCompositionEngineDeps = {}) {
    this.systemComposer = deps.systemComposer ?? createSystemComposer();
    this.identityComposer = deps.identityComposer ?? createIdentityComposer();
    this.knowledgeComposer =
      deps.knowledgeComposer ?? createKnowledgeComposer();
    this.conversationComposer =
      deps.conversationComposer ?? createConversationComposer();
    this.memoryComposer = deps.memoryComposer ?? createMemoryComposer();
    this.constraintComposer =
      deps.constraintComposer ?? createConstraintComposer();
    this.safetyComposer = deps.safetyComposer ?? createSafetyComposer();
    this.userInputComposer =
      deps.userInputComposer ?? createUserInputComposer();
    this.summaryComposer = deps.summaryComposer ?? createSummaryComposer();
  }

  /**
   * Compose an immutable PromptPackage from a ConversationContext.
   */
  compose(input: PromptCompositionInput): PromptEngineResult {
    if (!input.conversationContext) {
      throw new PromptEngineError(
        "missing_conversation_context",
        "ConversationContext is required",
      );
    }

    const softIssues = [
      ...validateCompositionInput(input),
      ...validateMissingInformation(input),
    ];

    const conversationContext = input.conversationContext;
    const composedAt = input.composedAt ?? DEFAULT_COMPOSED_AT;
    const packageId =
      input.packageId ??
      `prompt-package:${conversationContext.id}:${composedAt}`;

    const system = this.systemComposer.compose(conversationContext);
    const identity = this.identityComposer.compose(conversationContext);
    const safety = this.safetyComposer.compose(conversationContext);
    const constraints = this.constraintComposer.compose(conversationContext);
    const knowledge = this.knowledgeComposer.compose(
      conversationContext,
      input.insightSnapshot,
    );
    const memory = this.memoryComposer.compose(conversationContext);
    const conversation = this.conversationComposer.compose(conversationContext);
    const userInput = this.userInputComposer.compose(conversationContext);

    const blocks = normalizeBlockPriorities(
      sortBlocks(
        Object.freeze([
          system.block,
          identity.block,
          safety.block,
          constraints.block,
          knowledge.block,
          memory.block,
          conversation.block,
          userInput.block,
        ]),
      ),
    );

    const instructions = normalizeInstructionPriorities(
      sortInstructions(system.instructions),
    );

    const sections = aggregateSections(blocks);

    const context = this.buildPromptContext(
      conversationContext,
      input,
      composedAt,
    );

    const summary = this.summaryComposer.compose({
      packageId,
      conversationContextId: conversationContext.id,
      athleteId: conversationContext.session.athleteId,
      blocks,
      sections,
      instructions,
      primaryIntent: conversationContext.intent,
    });

    const composerNames = Object.freeze([
      "SystemComposer",
      "IdentityComposer",
      "SafetyComposer",
      "ConstraintComposer",
      "KnowledgeComposer",
      "MemoryComposer",
      "ConversationComposer",
      "UserInputComposer",
      "SummaryComposer",
    ]);

    const promptPackage = new PromptPackageBuilder()
      .withId(packageId)
      .withConversationContextId(conversationContext.id)
      .withContext(context)
      .withIdentity(identity.identity)
      .withKnowledge(knowledge.knowledge)
      .withConversation(conversation.conversation)
      .withMemory(memory.memory)
      .withConstraints(constraints.constraints)
      .withSafety(safety.safety)
      .withUserInput(userInput.userInput)
      .withInstructions(instructions)
      .withBlocks(blocks)
      .withSections(sections)
      .withComposerNames(composerNames)
      .withMetadata(
        Object.freeze({
          tags: Object.freeze(["prompt-composition", "foundation"]),
          attributes: Object.freeze({
            conversationContextId: conversationContext.id,
            coachingContextId:
              conversationContext.session.coachingContextId ?? null,
            insightSnapshotId: input.insightSnapshot?.id ?? null,
          }),
        }),
      )
      .withSummary(summary)
      .withFrozenAt(composedAt)
      .build();

    const snapshot = freezeSnapshot({
      id: packageId,
      promptPackage,
      summary,
      frozenAt: composedAt,
    });

    softIssues.push(...validateSnapshotIntegrity(snapshot));

    return freezeEngineResult({
      snapshot,
      promptPackage,
      summary,
      validationIssues: Object.freeze([...new Set(softIssues)]),
    });
  }

  /**
   * Create a PromptSnapshot from an existing PromptPackage.
   */
  createSnapshot(
    promptPackage: PromptPackage,
    options: {
      readonly snapshotId?: string;
      readonly frozenAt?: string;
      readonly summary?: PromptSummary;
    } = {},
  ): PromptSnapshot {
    const frozenAt = options.frozenAt ?? promptPackage.frozenAt;
    const snapshotId = options.snapshotId ?? promptPackage.id;
    const summary =
      options.summary ??
      (promptPackage.summary.packageId === snapshotId
        ? promptPackage.summary
        : new PromptSummaryBuilder()
            .withIds({
              packageId: snapshotId,
              conversationContextId: promptPackage.conversationContextId,
              athleteId: promptPackage.context.athleteId,
            })
            .withBlockCount(promptPackage.blocks.length)
            .withSectionCount(promptPackage.sections.length)
            .withInstructionCount(promptPackage.instructions.length)
            .withBlockTypes(promptPackage.summary.blockTypes)
            .withTopBlockIds(promptPackage.summary.topBlockIds)
            .withPrimaryIntent(promptPackage.summary.primaryIntent)
            .withSummaryText(promptPackage.summary.summaryText)
            .build());

    const alignedPackage =
      promptPackage.id === snapshotId &&
      promptPackage.summary.packageId === snapshotId
        ? promptPackage
        : new PromptPackageBuilder()
            .withId(snapshotId)
            .withConversationContextId(promptPackage.conversationContextId)
            .withContext(promptPackage.context)
            .withIdentity(promptPackage.identity)
            .withKnowledge(promptPackage.knowledge)
            .withConversation(promptPackage.conversation)
            .withMemory(promptPackage.memory)
            .withConstraints(promptPackage.constraints)
            .withSafety(promptPackage.safety)
            .withUserInput(promptPackage.userInput)
            .withInstructions(promptPackage.instructions)
            .withBlocks(promptPackage.blocks)
            .withSections(promptPackage.sections)
            .withComposerNames(promptPackage.composerNames)
            .withMetadata(promptPackage.metadata)
            .withSummary(summary)
            .withFrozenAt(frozenAt)
            .build();

    return freezeSnapshot({
      id: snapshotId,
      promptPackage: alignedPackage,
      summary,
      frozenAt,
    });
  }

  /**
   * Summarize a prompt package or snapshot.
   */
  summarize(
    packageOrSnapshot: PromptPackage | PromptSnapshot,
  ): PromptSummary {
    if ("promptPackage" in packageOrSnapshot && "summary" in packageOrSnapshot) {
      return packageOrSnapshot.summary;
    }
    return packageOrSnapshot.summary;
  }

  private buildPromptContext(
    conversationContext: ConversationContext,
    input: PromptCompositionInput,
    composedAt: string,
  ): PromptContext {
    return Object.freeze({
      conversationContextId: conversationContext.id,
      coachingContextId:
        input.coachingContext?.id ??
        conversationContext.session.coachingContextId,
      insightSnapshotId:
        input.insightSnapshot?.id ??
        conversationContext.session.insightSnapshotId,
      athleteId: conversationContext.session.athleteId,
      sessionId: conversationContext.session.sessionId,
      audience: conversationContext.audience,
      primaryIntent: conversationContext.intent,
      composedAt,
    });
  }
}

export function createPromptCompositionEngine(
  deps?: PromptCompositionEngineDeps,
): PromptCompositionEngine {
  return new PromptCompositionEngine(deps);
}
