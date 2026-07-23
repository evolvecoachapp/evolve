import type { ConversationContext } from "../../conversation-orchestrator/models/ConversationContext";
import {
  AthleteBlockBuilder,
  CapabilitiesBlockBuilder,
  ConstraintBlockBuilder,
  ConversationBlockBuilder,
  createAthleteBlockBuilder,
  createCapabilitiesBlockBuilder,
  createConstraintBlockBuilder,
  createConversationBlockBuilder,
  createFormattingBlockBuilder,
  createInsightBlockBuilder,
  createKnowledgeBlockBuilder,
  createPersonaBlockBuilder,
  createRecoveryBlockBuilder,
  createSafetyBlockBuilder,
  createSummaryBlockBuilder,
  createSystemBlockBuilder,
  createToolBlockBuilder,
  FormattingBlockBuilder,
  InsightBlockBuilder,
  KnowledgeBlockBuilder,
  PersonaBlockBuilder,
  RecoveryBlockBuilder,
  SafetyBlockBuilder,
  SummaryBlockBuilder,
  SystemBlockBuilder,
  ToolBlockBuilder,
} from "../blocks";
import { PromptPackageBuilder } from "../builders/PromptPackageBuilder";
import { PromptSummaryBuilder } from "../builders/PromptSummaryBuilder";
import { SystemPromptBuilder } from "../builders/SystemPromptBuilder";
import { UserPromptBuilder } from "../builders/UserPromptBuilder";
import { PromptBuildError } from "../models/PromptBuildError";
import type { PromptBuildResult } from "../models/PromptBuildResult";
import type { PromptCapability } from "../models/PromptCapability";
import type { PromptConstraint } from "../models/PromptConstraint";
import type { PromptContext } from "../models/PromptContext";
import type { PromptFormatting } from "../models/PromptFormatting";
import type { PromptInstruction } from "../models/PromptInstruction";
import type { PromptKnowledge } from "../models/PromptKnowledge";
import type { PromptPackage } from "../models/PromptPackage";
import type { PromptPersona } from "../models/PromptPersona";
import type { PromptSafety } from "../models/PromptSafety";
import type { SystemPrompt } from "../models/SystemPrompt";
import type { UserPrompt } from "../models/UserPrompt";
import { selectTemplatesForBlocks } from "../selectors/TemplateSelector";
import { DOMAIN_PROMPT_TEMPLATES } from "../templates";
import {
  freezeBuildResult,
  freezeCapability,
  freezeComposition,
  freezeConstraint,
  freezeContext,
  freezeFormatting,
  freezeInstruction,
  freezeKnowledge,
  freezePersona,
  freezeSafety,
  freezeSnapshot,
} from "../utils/freezePackage";
import { aggregateSections } from "../utils/formattingHelpers";
import { sortBlocks, sortInstructions } from "../utils/sortBlocks";
import { buildStatistics } from "../utils/statisticsHelpers";
import { validatePromptPackage } from "../validators/validatePromptPackage";

const DEFAULT_BUILT_AT = "2026-07-23T00:00:00.000Z";
const COMPOSER_NAME = "PromptComposer";

export interface PromptComposerDeps {
  readonly systemBlockBuilder?: SystemBlockBuilder;
  readonly personaBlockBuilder?: PersonaBlockBuilder;
  readonly capabilitiesBlockBuilder?: CapabilitiesBlockBuilder;
  readonly knowledgeBlockBuilder?: KnowledgeBlockBuilder;
  readonly conversationBlockBuilder?: ConversationBlockBuilder;
  readonly athleteBlockBuilder?: AthleteBlockBuilder;
  readonly recoveryBlockBuilder?: RecoveryBlockBuilder;
  readonly insightBlockBuilder?: InsightBlockBuilder;
  readonly constraintBlockBuilder?: ConstraintBlockBuilder;
  readonly formattingBlockBuilder?: FormattingBlockBuilder;
  readonly toolBlockBuilder?: ToolBlockBuilder;
  readonly safetyBlockBuilder?: SafetyBlockBuilder;
  readonly summaryBlockBuilder?: SummaryBlockBuilder;
}

export interface PromptComposeInput {
  readonly conversationContext: ConversationContext;
  readonly coachingContextId?: string | null;
  readonly insightSnapshotId?: string | null;
  readonly builtAt?: string;
  readonly packageId?: string;
}

/**
 * PromptComposer — receives blocks / ConversationContext, produces PromptPackage.
 * Deterministic only. No providers. No networking.
 */
export class PromptComposer {
  private readonly systemBlockBuilder: SystemBlockBuilder;
  private readonly personaBlockBuilder: PersonaBlockBuilder;
  private readonly capabilitiesBlockBuilder: CapabilitiesBlockBuilder;
  private readonly knowledgeBlockBuilder: KnowledgeBlockBuilder;
  private readonly conversationBlockBuilder: ConversationBlockBuilder;
  private readonly athleteBlockBuilder: AthleteBlockBuilder;
  private readonly recoveryBlockBuilder: RecoveryBlockBuilder;
  private readonly insightBlockBuilder: InsightBlockBuilder;
  private readonly constraintBlockBuilder: ConstraintBlockBuilder;
  private readonly formattingBlockBuilder: FormattingBlockBuilder;
  private readonly toolBlockBuilder: ToolBlockBuilder;
  private readonly safetyBlockBuilder: SafetyBlockBuilder;
  private readonly summaryBlockBuilder: SummaryBlockBuilder;

  constructor(deps: PromptComposerDeps = {}) {
    this.systemBlockBuilder =
      deps.systemBlockBuilder ?? createSystemBlockBuilder();
    this.personaBlockBuilder =
      deps.personaBlockBuilder ?? createPersonaBlockBuilder();
    this.capabilitiesBlockBuilder =
      deps.capabilitiesBlockBuilder ?? createCapabilitiesBlockBuilder();
    this.knowledgeBlockBuilder =
      deps.knowledgeBlockBuilder ?? createKnowledgeBlockBuilder();
    this.conversationBlockBuilder =
      deps.conversationBlockBuilder ?? createConversationBlockBuilder();
    this.athleteBlockBuilder =
      deps.athleteBlockBuilder ?? createAthleteBlockBuilder();
    this.recoveryBlockBuilder =
      deps.recoveryBlockBuilder ?? createRecoveryBlockBuilder();
    this.insightBlockBuilder =
      deps.insightBlockBuilder ?? createInsightBlockBuilder();
    this.constraintBlockBuilder =
      deps.constraintBlockBuilder ?? createConstraintBlockBuilder();
    this.formattingBlockBuilder =
      deps.formattingBlockBuilder ?? createFormattingBlockBuilder();
    this.toolBlockBuilder = deps.toolBlockBuilder ?? createToolBlockBuilder();
    this.safetyBlockBuilder =
      deps.safetyBlockBuilder ?? createSafetyBlockBuilder();
    this.summaryBlockBuilder =
      deps.summaryBlockBuilder ?? createSummaryBlockBuilder();
  }

  compose(input: PromptComposeInput): PromptBuildResult {
    if (!input.conversationContext) {
      throw new PromptBuildError(
        "missing_conversation_context",
        "ConversationContext is required",
      );
    }

    const ctx = input.conversationContext;
    const builtAt = input.builtAt ?? DEFAULT_BUILT_AT;
    const packageId =
      input.packageId ?? `prompt-package:${ctx.id}:${builtAt}`;

    const blocks = sortBlocks(
      Object.freeze([
        this.systemBlockBuilder.build(ctx),
        this.personaBlockBuilder.build(ctx),
        this.safetyBlockBuilder.build(ctx),
        this.constraintBlockBuilder.build(ctx),
        this.capabilitiesBlockBuilder.build(ctx),
        this.knowledgeBlockBuilder.build(ctx),
        this.athleteBlockBuilder.build(ctx),
        this.recoveryBlockBuilder.build(ctx),
        this.insightBlockBuilder.build(ctx),
        this.conversationBlockBuilder.build(ctx),
        this.formattingBlockBuilder.build(ctx),
        this.toolBlockBuilder.build(ctx),
        this.summaryBlockBuilder.build(ctx),
      ]),
    );

    const sections = aggregateSections(blocks);
    const templates = selectTemplatesForBlocks(blocks, DOMAIN_PROMPT_TEMPLATES);

    const coachingContextId =
      input.coachingContextId ??
      ctx.session.coachingContextId ??
      ctx.knowledge.coachingContextId ??
      null;
    const insightSnapshotId =
      input.insightSnapshotId ?? ctx.session.insightSnapshotId ?? null;

    const context: PromptContext = freezeContext({
      conversationContextId: ctx.id,
      coachingContextId,
      insightSnapshotId,
      athleteId: ctx.session.athleteId,
      sessionId: ctx.session.sessionId,
      audience: ctx.audience,
      primaryIntent: ctx.intent,
      composedAt: builtAt,
    });

    const persona: PromptPersona = freezePersona({
      id: `prompt-persona:${ctx.id}`,
      role: "coach",
      audience: ctx.audience,
      style: "structured_supportive",
      statement: `Coach persona for audience ${ctx.audience}.`,
      refs: Object.freeze([ctx.id]),
    });

    const capabilities: PromptCapability = freezeCapability({
      id: `prompt-capability:${ctx.id}`,
      codes: Object.freeze(["coach", "conversation", "insight_aware"]),
      statements: Object.freeze([
        `Capability scope for intent ${ctx.intent}.`,
      ]),
      refs: Object.freeze([ctx.id]),
    });

    const knowledge: PromptKnowledge = freezeKnowledge({
      id: `prompt-knowledge:${ctx.id}`,
      coachingContextId,
      conversationContextId: ctx.id,
      objectiveIds: Object.freeze([...ctx.knowledge.objectiveIds]),
      insightIds: Object.freeze([...ctx.knowledge.insightIds]),
      evidenceIds: Object.freeze(ctx.evidence.map((e) => e.id)),
      knowledgeRefs: Object.freeze([
        ...ctx.request.knowledgeRefs,
        ...ctx.knowledge.selectedObjectiveIds,
      ]),
      recoveryReferenced: ctx.knowledge.recoveryReferenced,
      historyReferenced: ctx.knowledge.historyReferenced,
      performanceReferenced: ctx.knowledge.performanceReferenced,
      achievementReferenced: ctx.knowledge.achievementReferenced,
      statement: `Knowledge composition for conversation ${ctx.id}.`,
    });

    const formatting: PromptFormatting = freezeFormatting({
      id: `prompt-formatting:${ctx.id}`,
      style: "structured_facts",
      rules: Object.freeze([
        "use_structured_blocks",
        "no_provider_syntax",
        "deterministic_ordering",
      ]),
      statement: "Formatting rules for structured coach composition.",
    });

    const constraints: readonly PromptConstraint[] = Object.freeze(
      ctx.constraints.map((c) =>
        freezeConstraint({
          id: `prompt-constraint:${c.id}`,
          code: c.code,
          statement: c.statement,
          priority: c.priority,
          sourceRefs: Object.freeze([c.id, c.sourceId]),
          metadata: Object.freeze({
            tags: Object.freeze(["constraint"]),
            attributes: Object.freeze({
              sourceType: c.sourceType,
            }),
          }),
        }),
      ),
    );

    const safety: PromptSafety = freezeSafety({
      id: `prompt-safety:${ctx.id}`,
      codes: Object.freeze(["coach_safety"]),
      constraintIds: Object.freeze(constraints.map((c) => c.id)),
      statement: `Safety markers for conversation ${ctx.id}.`,
    });

    const instructions: readonly PromptInstruction[] = sortInstructions(
      Object.freeze([
        freezeInstruction({
          id: `prompt-instruction:system:${ctx.id}`,
          code: "compose_system",
          statement: `System composition for conversation context ${ctx.id}.`,
          priority: 90,
          sourceRefs: Object.freeze([ctx.id]),
          metadata: Object.freeze({
            tags: Object.freeze(["system", "composition"]),
            attributes: Object.freeze({
              stage: ctx.stage,
              state: ctx.state,
            }),
          }),
        }),
      ]),
    );

    const tools = Object.freeze([
      Object.freeze({
        id: `prompt-tool:placeholder:${ctx.id}`,
        name: "placeholder_tool",
        description: "Foundation placeholder — no execution",
        parameterSchema: Object.freeze({}),
        enabled: false,
      }),
    ]);

    const systemPrompt = this.buildSystemPromptFromBlocks(
      packageId,
      blocks,
      builtAt,
    );
    const userPrompt = this.buildUserPromptFromContext(
      packageId,
      ctx,
      blocks,
      builtAt,
    );

    const statistics = buildStatistics({
      blocks,
      sections,
      instructions,
      constraints,
    });

    const summary = new PromptSummaryBuilder()
      .withPackageId(packageId)
      .withConversationContextId(ctx.id)
      .withAthleteId(ctx.session.athleteId)
      .withBlockCount(blocks.length)
      .withSectionCount(sections.length)
      .withInstructionCount(instructions.length)
      .withBlockTypes(Object.freeze(blocks.map((b) => b.type)))
      .withTopBlockIds(Object.freeze(blocks.slice(0, 5).map((b) => b.id)))
      .withPrimaryIntent(ctx.intent)
      .withSummaryText(
        `Prompt package ${packageId} with ${blocks.length} prompt blocks.`,
      )
      .build();

    const composition = freezeComposition({
      id: `prompt-composition:${packageId}`,
      packageId,
      blockIds: Object.freeze(blocks.map((b) => b.id)),
      sectionIds: Object.freeze([...sections]),
      templateIds: Object.freeze(templates.map((t) => t.id)),
      composerName: COMPOSER_NAME,
      composedAt: builtAt,
    });

    const promptPackage = new PromptPackageBuilder()
      .withId(packageId)
      .withConversationContextId(ctx.id)
      .withContext(context)
      .withPersona(persona)
      .withCapabilities(capabilities)
      .withKnowledge(knowledge)
      .withFormatting(formatting)
      .withSafety(safety)
      .withConstraints(constraints)
      .withInstructions(instructions)
      .withTools(tools)
      .withBlocks(blocks)
      .withSections(sections)
      .withTemplates(templates)
      .withSystemPrompt(systemPrompt)
      .withUserPrompt(userPrompt)
      .withAssistantPrompt(null)
      .withComposition(composition)
      .withStatistics(statistics)
      .withMetadata(
        Object.freeze({
          tags: Object.freeze(["prompt_builder", "composition"]),
          attributes: Object.freeze({
            composer: COMPOSER_NAME,
            builtAt,
          }),
        }),
      )
      .withSummary(summary)
      .withFrozenAt(builtAt)
      .build();

    const validationIssues = validatePromptPackage(promptPackage);

    const snapshot = freezeSnapshot({
      id: `prompt-snapshot:${packageId}`,
      promptPackage,
      summary,
      statistics,
      frozenAt: builtAt,
    });

    return freezeBuildResult({
      snapshot,
      promptPackage,
      summary,
      statistics,
      systemPrompt,
      userPrompt,
      validationIssues,
    });
  }

  buildSystemPrompt(promptPackage: PromptPackage): SystemPrompt {
    return this.buildSystemPromptFromBlocks(
      promptPackage.id,
      promptPackage.blocks,
      promptPackage.frozenAt,
    );
  }

  buildUserPrompt(promptPackage: PromptPackage): UserPrompt {
    return new UserPromptBuilder()
      .withId(`user-prompt:${promptPackage.id}`)
      .withStatements(
        Object.freeze([
          promptPackage.context.primaryIntent
            ? `User intent ${promptPackage.context.primaryIntent}.`
            : "User intent unspecified.",
          ...promptPackage.blocks
            .filter((b) => b.type === "conversation" || b.type === "athlete")
            .map((b) => b.statement),
        ]),
      )
      .withBlockIds(
        Object.freeze(
          promptPackage.blocks
            .filter((b) => b.type === "conversation" || b.type === "athlete")
            .map((b) => b.id),
        ),
      )
      .withRequestId(null)
      .withFrozenAt(promptPackage.frozenAt)
      .build();
  }

  private buildSystemPromptFromBlocks(
    packageId: string,
    blocks: PromptPackage["blocks"],
    frozenAt: string,
  ): SystemPrompt {
    const systemBlocks = blocks.filter(
      (b) =>
        b.type === "system" ||
        b.type === "persona" ||
        b.type === "safety" ||
        b.type === "constraint" ||
        b.type === "capabilities" ||
        b.type === "formatting",
    );
    return new SystemPromptBuilder()
      .withId(`system-prompt:${packageId}`)
      .withStatements(Object.freeze(systemBlocks.map((b) => b.statement)))
      .withBlockIds(Object.freeze(systemBlocks.map((b) => b.id)))
      .withFrozenAt(frozenAt)
      .build();
  }

  private buildUserPromptFromContext(
    packageId: string,
    ctx: ConversationContext,
    blocks: PromptPackage["blocks"],
    frozenAt: string,
  ): UserPrompt {
    const userBlocks = blocks.filter(
      (b) =>
        b.type === "conversation" ||
        b.type === "athlete" ||
        b.type === "knowledge" ||
        b.type === "insight" ||
        b.type === "recovery" ||
        b.type === "summary",
    );
    return new UserPromptBuilder()
      .withId(`user-prompt:${packageId}`)
      .withStatements(
        Object.freeze([
          ctx.request.statement,
          ...userBlocks.map((b) => b.statement),
        ]),
      )
      .withBlockIds(Object.freeze(userBlocks.map((b) => b.id)))
      .withRequestId(ctx.request.id)
      .withFrozenAt(frozenAt)
      .build();
  }
}

export function createPromptComposer(
  deps?: PromptComposerDeps,
): PromptComposer {
  return new PromptComposer(deps);
}
