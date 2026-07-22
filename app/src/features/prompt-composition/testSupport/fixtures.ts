import { prepareConversation } from "../../conversation-orchestrator/application";
import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import {
  createFullConversationInputs,
  FIXED_TIMESTAMP as CONVERSATION_FIXED_TIMESTAMP,
} from "../../conversation-orchestrator/testSupport/fixtures";
import type { CoachingContext } from "../../coach-intelligence/models/CoachingContext";
import type { InsightSnapshot } from "../../insight-engine/models/InsightSnapshot";
import { PromptBlockBuilder } from "../builders/PromptBlockBuilder";
import { PromptPackageBuilder } from "../builders/PromptPackageBuilder";
import { PromptSummaryBuilder } from "../builders/PromptSummaryBuilder";
import type { PromptBlock } from "../models/PromptBlock";
import { PromptBlockTypes } from "../models/PromptBlockType";
import type { PromptPackage } from "../models/PromptPackage";
import { PromptSections } from "../models/PromptSection";

export const FIXED_TIMESTAMP = CONVERSATION_FIXED_TIMESTAMP;

export { createFullConversationInputs } from "../../conversation-orchestrator/testSupport/fixtures";

export function createFullPromptCompositionInputs(): {
  readonly conversationContext: ConversationContext;
  readonly coachingContext: CoachingContext;
  readonly insightSnapshot: InsightSnapshot;
} {
  const conversationInputs = createFullConversationInputs();
  const conversation = prepareConversation({
    ...conversationInputs,
    preparedAt: FIXED_TIMESTAMP,
    contextId: "conversation:prompt-full",
  });

  return Object.freeze({
    conversationContext: conversation.context,
    coachingContext: conversationInputs.coachingContext,
    insightSnapshot: conversationInputs.insightSnapshot,
  });
}

export function createPromptBlockFixture(
  overrides: Partial<PromptBlock> & { readonly id?: string } = {},
): PromptBlock {
  const type = overrides.type ?? PromptBlockTypes.SYSTEM;
  return new PromptBlockBuilder()
    .withId(overrides.id ?? "prompt-block:fixture:system")
    .withType(type)
    .withSection(overrides.section ?? PromptSections.SYSTEM)
    .withPriority(overrides.priority ?? 50)
    .withOrder(overrides.order ?? 10)
    .withTitle(overrides.title ?? "Fixture block")
    .withStatement(overrides.statement ?? "Fixture block statement.")
    .withRefs(overrides.refs ?? [])
    .withMetadata(
      overrides.metadata ??
        Object.freeze({
          tags: Object.freeze(["fixture"]),
          attributes: Object.freeze({}),
        }),
    )
    .withAttributes(overrides.attributes ?? Object.freeze({}))
    .build();
}

export function createPromptPackageFixture(
  overrides: {
    readonly id?: string;
    readonly conversationContextId?: string;
  } = {},
): PromptPackage {
  const id = overrides.id ?? "prompt-package:fixture";
  const conversationContextId =
    overrides.conversationContextId ?? "conversation:fixture";

  const blocks = Object.freeze([
    createPromptBlockFixture({
      id: `${id}:system`,
      type: PromptBlockTypes.SYSTEM,
      section: PromptSections.SYSTEM,
      order: 10,
      priority: 90,
      title: "System",
    }),
    createPromptBlockFixture({
      id: `${id}:identity`,
      type: PromptBlockTypes.IDENTITY,
      section: PromptSections.IDENTITY,
      order: 20,
      priority: 85,
      title: "Identity",
    }),
    createPromptBlockFixture({
      id: `${id}:safety`,
      type: PromptBlockTypes.SAFETY,
      section: PromptSections.SAFETY,
      order: 30,
      priority: 88,
      title: "Safety",
    }),
    createPromptBlockFixture({
      id: `${id}:constraints`,
      type: PromptBlockTypes.CONSTRAINTS,
      section: PromptSections.CONSTRAINTS,
      order: 40,
      priority: 80,
      title: "Constraints",
    }),
    createPromptBlockFixture({
      id: `${id}:knowledge`,
      type: PromptBlockTypes.KNOWLEDGE,
      section: PromptSections.KNOWLEDGE,
      order: 50,
      priority: 70,
      title: "Knowledge",
    }),
    createPromptBlockFixture({
      id: `${id}:memory`,
      type: PromptBlockTypes.MEMORY,
      section: PromptSections.MEMORY,
      order: 60,
      priority: 55,
      title: "Memory",
    }),
    createPromptBlockFixture({
      id: `${id}:conversation`,
      type: PromptBlockTypes.CONVERSATION,
      section: PromptSections.CONVERSATION,
      order: 70,
      priority: 60,
      title: "Conversation",
    }),
    createPromptBlockFixture({
      id: `${id}:user-input`,
      type: PromptBlockTypes.USER_INPUT,
      section: PromptSections.USER_INPUT,
      order: 80,
      priority: 50,
      title: "User Input",
    }),
  ]);

  const sections = Object.freeze([
    PromptSections.SYSTEM,
    PromptSections.IDENTITY,
    PromptSections.SAFETY,
    PromptSections.CONSTRAINTS,
    PromptSections.KNOWLEDGE,
    PromptSections.MEMORY,
    PromptSections.CONVERSATION,
    PromptSections.USER_INPUT,
  ]);

  const summary = new PromptSummaryBuilder()
    .withIds({
      packageId: id,
      conversationContextId,
      athleteId: null,
    })
    .withBlockCount(blocks.length)
    .withSectionCount(sections.length)
    .withInstructionCount(0)
    .withBlockTypes(blocks.map((block) => block.type))
    .withTopBlockIds(blocks.slice(0, 3).map((block) => block.id))
    .withPrimaryIntent("focus")
    .withSummaryText(`${blocks.length} prompt blocks.`)
    .build();

  return new PromptPackageBuilder()
    .withId(id)
    .withConversationContextId(conversationContextId)
    .withContext(
      Object.freeze({
        conversationContextId,
        coachingContextId: "coach:fixture",
        insightSnapshotId: null,
        athleteId: null,
        sessionId: "session-1",
        audience: "athlete",
        primaryIntent: "focus",
        composedAt: FIXED_TIMESTAMP,
      }),
    )
    .withIdentity(
      Object.freeze({
        id: `prompt-identity:${id}`,
        roleCode: "coach_orchestrator",
        audience: "athlete",
        communicationStyle: null,
        statement: "Fixture identity.",
        refs: Object.freeze([conversationContextId]),
      }),
    )
    .withKnowledge(
      Object.freeze({
        id: `prompt-knowledge:${id}`,
        coachingContextId: "coach:fixture",
        conversationContextId,
        objectiveIds: Object.freeze([] as string[]),
        insightIds: Object.freeze([] as string[]),
        evidenceIds: Object.freeze([] as string[]),
        knowledgeRefs: Object.freeze([] as string[]),
        recoveryReferenced: false,
        historyReferenced: false,
        performanceReferenced: false,
        achievementReferenced: false,
        statement: "Fixture knowledge.",
      }),
    )
    .withConversation(
      Object.freeze({
        id: `prompt-conversation:${id}`,
        conversationContextId,
        goalIds: Object.freeze([] as string[]),
        turnIds: Object.freeze([] as string[]),
        messageIds: Object.freeze([] as string[]),
        requestId: null,
        primaryIntent: "focus",
        statement: "Fixture conversation.",
      }),
    )
    .withMemory(
      Object.freeze({
        id: `prompt-memory:${id}`,
        conversationContextId,
        memoryRefs: Object.freeze([] as string[]),
        historyReferenced: false,
        statement: "Fixture memory.",
      }),
    )
    .withConstraints(
      Object.freeze({
        id: `prompt-constraints:${id}`,
        constraintIds: Object.freeze([] as string[]),
        codes: Object.freeze([] as string[]),
        statement: "Fixture constraints.",
      }),
    )
    .withSafety(
      Object.freeze({
        id: `prompt-safety:${id}`,
        codes: Object.freeze(["safety_composition"]),
        constraintIds: Object.freeze([] as string[]),
        statement: "Fixture safety.",
      }),
    )
    .withUserInput(
      Object.freeze({
        id: `prompt-user-input:${id}`,
        conversationContextId,
        requestId: null,
        goalIds: Object.freeze([] as string[]),
        primaryIntent: "focus",
        statement: "Fixture user input.",
      }),
    )
    .withInstructions([])
    .withBlocks(blocks)
    .withSections(sections)
    .withComposerNames(Object.freeze(["SystemComposer"]))
    .withSummary(summary)
    .withFrozenAt(FIXED_TIMESTAMP)
    .build();
}
