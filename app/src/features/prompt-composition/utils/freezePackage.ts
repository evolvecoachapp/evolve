import type { PromptBlock } from "../models/PromptBlock";
import type { PromptConstraints } from "../models/PromptConstraints";
import type { PromptContext } from "../models/PromptContext";
import type { PromptConversation } from "../models/PromptConversation";
import type { PromptEngineResult } from "../models/PromptEngineResult";
import type { PromptIdentity } from "../models/PromptIdentity";
import type { PromptInstruction } from "../models/PromptInstruction";
import type { PromptKnowledge } from "../models/PromptKnowledge";
import type { PromptMemory } from "../models/PromptMemory";
import type { PromptMetadata } from "../models/PromptMetadata";
import type { PromptPackage } from "../models/PromptPackage";
import type { PromptSafety } from "../models/PromptSafety";
import type { PromptSnapshot } from "../models/PromptSnapshot";
import type { PromptSummary } from "../models/PromptSummary";
import type { PromptUserInput } from "../models/PromptUserInput";

function freezeMetadata(metadata: PromptMetadata): PromptMetadata {
  return Object.freeze({
    tags: Object.freeze([...metadata.tags]),
    attributes: Object.freeze({ ...metadata.attributes }),
  });
}

export function freezeBlock(block: PromptBlock): PromptBlock {
  return Object.freeze({
    ...block,
    refs: Object.freeze([...block.refs]),
    metadata: freezeMetadata(block.metadata),
    attributes: Object.freeze({ ...block.attributes }),
  });
}

export function freezeInstruction(
  instruction: PromptInstruction,
): PromptInstruction {
  return Object.freeze({
    ...instruction,
    sourceRefs: Object.freeze([...instruction.sourceRefs]),
    metadata: freezeMetadata(instruction.metadata),
  });
}

export function freezeContext(context: PromptContext): PromptContext {
  return Object.freeze({ ...context });
}

export function freezeIdentity(identity: PromptIdentity): PromptIdentity {
  return Object.freeze({
    ...identity,
    refs: Object.freeze([...identity.refs]),
  });
}

export function freezeKnowledge(knowledge: PromptKnowledge): PromptKnowledge {
  return Object.freeze({
    ...knowledge,
    objectiveIds: Object.freeze([...knowledge.objectiveIds]),
    insightIds: Object.freeze([...knowledge.insightIds]),
    evidenceIds: Object.freeze([...knowledge.evidenceIds]),
    knowledgeRefs: Object.freeze([...knowledge.knowledgeRefs]),
  });
}

export function freezeConversation(
  conversation: PromptConversation,
): PromptConversation {
  return Object.freeze({
    ...conversation,
    goalIds: Object.freeze([...conversation.goalIds]),
    turnIds: Object.freeze([...conversation.turnIds]),
    messageIds: Object.freeze([...conversation.messageIds]),
  });
}

export function freezeMemory(memory: PromptMemory): PromptMemory {
  return Object.freeze({
    ...memory,
    memoryRefs: Object.freeze([...memory.memoryRefs]),
  });
}

export function freezeConstraints(
  constraints: PromptConstraints,
): PromptConstraints {
  return Object.freeze({
    ...constraints,
    constraintIds: Object.freeze([...constraints.constraintIds]),
    codes: Object.freeze([...constraints.codes]),
  });
}

export function freezeSafety(safety: PromptSafety): PromptSafety {
  return Object.freeze({
    ...safety,
    codes: Object.freeze([...safety.codes]),
    constraintIds: Object.freeze([...safety.constraintIds]),
  });
}

export function freezeUserInput(userInput: PromptUserInput): PromptUserInput {
  return Object.freeze({
    ...userInput,
    goalIds: Object.freeze([...userInput.goalIds]),
  });
}

export function freezePromptSummary(summary: PromptSummary): PromptSummary {
  return Object.freeze({
    ...summary,
    blockTypes: Object.freeze([...summary.blockTypes]),
    topBlockIds: Object.freeze([...summary.topBlockIds]),
  });
}

/**
 * Deep-freeze a prompt package for immutability guarantees.
 */
export function freezePackage(promptPackage: PromptPackage): PromptPackage {
  return Object.freeze({
    ...promptPackage,
    context: freezeContext(promptPackage.context),
    identity: freezeIdentity(promptPackage.identity),
    knowledge: freezeKnowledge(promptPackage.knowledge),
    conversation: freezeConversation(promptPackage.conversation),
    memory: freezeMemory(promptPackage.memory),
    constraints: freezeConstraints(promptPackage.constraints),
    safety: freezeSafety(promptPackage.safety),
    userInput: freezeUserInput(promptPackage.userInput),
    instructions: Object.freeze(
      promptPackage.instructions.map(freezeInstruction),
    ),
    blocks: Object.freeze(promptPackage.blocks.map(freezeBlock)),
    sections: Object.freeze([...promptPackage.sections]),
    composerNames: Object.freeze([...promptPackage.composerNames]),
    metadata: freezeMetadata(promptPackage.metadata),
    summary: freezePromptSummary(promptPackage.summary),
  });
}

export function freezeSnapshot(snapshot: PromptSnapshot): PromptSnapshot {
  return Object.freeze({
    ...snapshot,
    promptPackage: freezePackage(snapshot.promptPackage),
    summary: freezePromptSummary(snapshot.summary),
  });
}

export function freezeEngineResult(
  result: PromptEngineResult,
): PromptEngineResult {
  return Object.freeze({
    snapshot: freezeSnapshot(result.snapshot),
    promptPackage: freezePackage(result.promptPackage),
    summary: freezePromptSummary(result.summary),
    validationIssues: Object.freeze([...result.validationIssues]),
  });
}
