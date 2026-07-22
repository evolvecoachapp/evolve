import type { CoachConstraint } from "../models/CoachConstraint";
import type { CoachContextSnapshot } from "../models/CoachContextSnapshot";
import type { CoachEngineResult } from "../models/CoachEngineResult";
import type { CoachEvidence } from "../models/CoachEvidence";
import type { CoachFocus } from "../models/CoachFocus";
import type { CoachInstruction } from "../models/CoachInstruction";
import type { CoachKnowledge } from "../models/CoachKnowledge";
import type { CoachMetadata } from "../models/CoachMetadata";
import type { CoachObjective } from "../models/CoachObjective";
import type { CoachPreparation } from "../models/CoachPreparation";
import type { CoachReason } from "../models/CoachReason";
import type { CoachSession } from "../models/CoachSession";
import type { CoachingContext } from "../models/CoachingContext";
import type { CoachingContextSummary } from "../models/CoachingContextSummary";

function freezeReason(reason: CoachReason): CoachReason {
  return Object.freeze({
    ...reason,
    attributes: Object.freeze({ ...reason.attributes }),
  });
}

function freezeMetadata(metadata: CoachMetadata): CoachMetadata {
  return Object.freeze({
    tags: Object.freeze([...metadata.tags]),
    attributes: Object.freeze({ ...metadata.attributes }),
  });
}

export function freezeObjective(objective: CoachObjective): CoachObjective {
  return Object.freeze({
    ...objective,
    reason: freezeReason(objective.reason),
    evidenceIds: Object.freeze([...objective.evidenceIds]),
    focusIds: Object.freeze([...objective.focusIds]),
    metadata: freezeMetadata(objective.metadata),
  });
}

export function freezeConstraint(
  constraint: CoachConstraint,
): CoachConstraint {
  return Object.freeze({
    ...constraint,
    reason: freezeReason(constraint.reason),
  });
}

export function freezeInstruction(
  instruction: CoachInstruction,
): CoachInstruction {
  return Object.freeze({
    ...instruction,
    reason: freezeReason(instruction.reason),
    evidenceIds: Object.freeze([...instruction.evidenceIds]),
  });
}

export function freezeFocus(focus: CoachFocus): CoachFocus {
  return Object.freeze({
    ...focus,
    insightIds: Object.freeze([...focus.insightIds]),
    reason: freezeReason(focus.reason),
  });
}

export function freezeEvidence(evidence: CoachEvidence): CoachEvidence {
  return Object.freeze({
    ...evidence,
    attributes: Object.freeze({ ...evidence.attributes }),
  });
}

export function freezeKnowledge(knowledge: CoachKnowledge): CoachKnowledge {
  return Object.freeze({
    ...knowledge,
    insightIds: Object.freeze([...knowledge.insightIds]),
    selectedInsightIds: Object.freeze([...knowledge.selectedInsightIds]),
    attributes: Object.freeze({ ...knowledge.attributes }),
  });
}

export function freezePreparation(
  preparation: CoachPreparation,
): CoachPreparation {
  return Object.freeze({
    ...preparation,
    selectorNames: Object.freeze([...preparation.selectorNames]),
    missingInformation: Object.freeze([...preparation.missingInformation]),
  });
}

export function freezeSession(session: CoachSession): CoachSession {
  return Object.freeze({ ...session });
}

export function freezeCoachingContextSummary(
  summary: CoachingContextSummary,
): CoachingContextSummary {
  return Object.freeze({
    ...summary,
    topObjectiveIds: Object.freeze([...summary.topObjectiveIds]),
  });
}

/**
 * Deep-freeze a coaching context for immutability guarantees.
 */
export function freezeContext(context: CoachingContext): CoachingContext {
  return Object.freeze({
    ...context,
    session: freezeSession(context.session),
    objectives: Object.freeze(context.objectives.map(freezeObjective)),
    constraints: Object.freeze(context.constraints.map(freezeConstraint)),
    instructions: Object.freeze(context.instructions.map(freezeInstruction)),
    focus: Object.freeze(context.focus.map(freezeFocus)),
    evidence: Object.freeze(context.evidence.map(freezeEvidence)),
    knowledge: freezeKnowledge(context.knowledge),
    preparation: freezePreparation(context.preparation),
    metadata: freezeMetadata(context.metadata),
    summary: freezeCoachingContextSummary(context.summary),
  });
}

export function freezeSnapshot(
  snapshot: CoachContextSnapshot,
): CoachContextSnapshot {
  return Object.freeze({
    ...snapshot,
    context: freezeContext(snapshot.context),
    summary: freezeCoachingContextSummary(snapshot.summary),
  });
}

export function freezeEngineResult(
  result: CoachEngineResult,
): CoachEngineResult {
  return Object.freeze({
    snapshot: freezeSnapshot(result.snapshot),
    context: freezeContext(result.context),
    summary: freezeCoachingContextSummary(result.summary),
    validationIssues: Object.freeze([...result.validationIssues]),
  });
}
