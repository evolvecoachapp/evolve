import type {
  CoachConflict,
  CoachDecision,
  CoachRecommendation,
} from "../models/CoachDecision";
import { CoachConflictKinds } from "../models/CoachDecision";
import { EMPTY_COACH_METADATA } from "../models/CoachMetadata";
import type { SpecialistAgentOutputs } from "../models/SpecialistAgentInvocation";
import type { SpecialistAgentKind } from "../models/SpecialistAgentKind";
import { SpecialistAgentKinds } from "../models/SpecialistAgentKind";
import { freezeDecision } from "../utils/FreezeCoachState";

/** Deterministic priority: recovery safety > workout > nutrition. */
const AGENT_PRIORITY: Readonly<Record<string, number>> = Object.freeze({
  [SpecialistAgentKinds.RECOVERY]: 300,
  [SpecialistAgentKinds.WORKOUT]: 200,
  [SpecialistAgentKinds.NUTRITION]: 100,
  [SpecialistAgentKinds.SLEEP]: 250,
  [SpecialistAgentKinds.INJURY]: 350,
  [SpecialistAgentKinds.MOBILITY]: 150,
  [SpecialistAgentKinds.PLANNING]: 50,
});

function agentPriority(kind: SpecialistAgentKind): number {
  return AGENT_PRIORITY[kind] ?? 0;
}

function extractRecommendations(
  outputs: SpecialistAgentOutputs,
): CoachRecommendation[] {
  const recommendations: CoachRecommendation[] = [];

  if (outputs.workout) {
    for (const rec of outputs.workout.recommendations) {
      recommendations.push({
        id: `crec:workout:${rec.id}`,
        sourceAgent: SpecialistAgentKinds.WORKOUT,
        sourceRecommendationId: rec.id,
        category: rec.category,
        title: rec.title,
        detail: rec.detail,
        priority: rec.priority + agentPriority(SpecialistAgentKinds.WORKOUT),
        confidenceScore: rec.confidence.score,
      });
    }
  }

  if (outputs.recovery) {
    for (const rec of outputs.recovery.recommendations) {
      recommendations.push({
        id: `crec:recovery:${rec.id}`,
        sourceAgent: SpecialistAgentKinds.RECOVERY,
        sourceRecommendationId: rec.id,
        category: rec.category,
        title: rec.title,
        detail: rec.detail,
        priority: rec.priority + agentPriority(SpecialistAgentKinds.RECOVERY),
        confidenceScore: 0.8,
      });
    }
  }

  if (outputs.nutrition) {
    for (const rec of outputs.nutrition.recommendations) {
      recommendations.push({
        id: `crec:nutrition:${rec.id}`,
        sourceAgent: SpecialistAgentKinds.NUTRITION,
        sourceRecommendationId: rec.id,
        category: rec.category,
        title: rec.title,
        detail: rec.detail,
        priority: rec.priority + agentPriority(SpecialistAgentKinds.NUTRITION),
        confidenceScore: rec.confidence.score,
      });
    }
  }

  return recommendations.sort((a, b) => b.priority - a.priority);
}

function detectConflicts(
  outputs: SpecialistAgentOutputs,
): CoachConflict[] {
  const conflicts: CoachConflict[] = [];
  const active: SpecialistAgentKind[] = [];

  if (outputs.workout) active.push(SpecialistAgentKinds.WORKOUT);
  if (outputs.recovery) active.push(SpecialistAgentKinds.RECOVERY);
  if (outputs.nutrition) active.push(SpecialistAgentKinds.NUTRITION);

  const successFlags = [
    outputs.workout?.success,
    outputs.recovery?.success,
    outputs.nutrition?.success,
  ].filter((v) => v !== undefined && v !== null) as boolean[];

  if (successFlags.length > 1 && successFlags.some((s) => !s) && successFlags.some((s) => s)) {
    const failedAgents: SpecialistAgentKind[] = [];
    if (outputs.workout && !outputs.workout.success) {
      failedAgents.push(SpecialistAgentKinds.WORKOUT);
    }
    if (outputs.recovery && !outputs.recovery.success) {
      failedAgents.push(SpecialistAgentKinds.RECOVERY);
    }
    if (outputs.nutrition && !outputs.nutrition.success) {
      failedAgents.push(SpecialistAgentKinds.NUTRITION);
    }
    conflicts.push({
      id: "conflict:success:partial",
      kind: CoachConflictKinds.SUCCESS,
      agents: failedAgents,
      description: "Partial specialist failure — some agents succeeded, others failed.",
      resolved: true,
      resolution: "Prefer successful agent recommendations; mark overall acceptance conservatively.",
    });
  }

  const acceptedFlags = [
    outputs.workout?.decision.accepted,
    outputs.recovery?.decision.accepted,
    outputs.nutrition?.decision.accepted,
  ].filter((v) => v !== undefined && v !== null) as boolean[];

  if (
    acceptedFlags.length > 1 &&
    acceptedFlags.some((a) => !a) &&
    acceptedFlags.some((a) => a)
  ) {
    conflicts.push({
      id: "conflict:acceptance:mixed",
      kind: CoachConflictKinds.ACCEPTANCE,
      agents: active,
      description: "Mixed decision acceptance across specialist agents.",
      resolved: true,
      resolution: "Prioritize agents by safety order (recovery > workout > nutrition).",
    });
  }

  if (
    outputs.workout?.success &&
    outputs.recovery?.success &&
    outputs.recovery.decision.accepted === false &&
    outputs.workout.decision.accepted === true
  ) {
    conflicts.push({
      id: "conflict:domain:recovery_blocks_workout",
      kind: CoachConflictKinds.DOMAIN,
      agents: Object.freeze([
        SpecialistAgentKinds.RECOVERY,
        SpecialistAgentKinds.WORKOUT,
      ]),
      description:
        "Recovery agent rejected plan while workout agent accepted — recovery takes precedence.",
      resolved: true,
      resolution: "Elevate recovery recommendations above workout recommendations.",
    });
  }

  return conflicts;
}

/**
 * Pure deterministic merger of specialist agent outputs.
 * No AI. No networking. No domain calculations.
 */
export class CoachResultMerger {
  merge(input: {
    readonly id: string;
    readonly outputs: SpecialistAgentOutputs;
    readonly decidedAt: string;
  }): CoachDecision {
    const recommendations = extractRecommendations(input.outputs);
    const conflicts = detectConflicts(input.outputs);

    const presentAgents: SpecialistAgentKind[] = [];
    if (input.outputs.workout) presentAgents.push(SpecialistAgentKinds.WORKOUT);
    if (input.outputs.recovery) presentAgents.push(SpecialistAgentKinds.RECOVERY);
    if (input.outputs.nutrition) presentAgents.push(SpecialistAgentKinds.NUTRITION);

    const prioritizedAgents = Object.freeze(
      [...presentAgents].sort((a, b) => agentPriority(b) - agentPriority(a)),
    );

    const invoked = input.outputs.invocations.filter(
      (item) => item.status === "invoked" || item.status === "failed",
    );
    const allSucceeded =
      invoked.length > 0 &&
      invoked.every((item) => item.status === "invoked" && item.success !== false);

    const decisionsAccepted = [
      input.outputs.workout?.decision.accepted,
      input.outputs.recovery?.decision.accepted,
      input.outputs.nutrition?.decision.accepted,
    ].filter((v): v is boolean => typeof v === "boolean");

    const accepted =
      allSucceeded &&
      decisionsAccepted.length > 0 &&
      decisionsAccepted.every(Boolean) &&
      !conflicts.some((c) => c.kind === CoachConflictKinds.DOMAIN);

    const confidenceScores = recommendations.map((r) => r.confidenceScore);
    const confidenceScore =
      confidenceScores.length > 0
        ? confidenceScores.reduce((a, b) => a + b, 0) / confidenceScores.length
        : accepted
          ? 0.7
          : 0.3;

    const reasons: string[] = [
      `Merged ${presentAgents.length} specialist agent output(s).`,
      `Prioritized agents: ${prioritizedAgents.join(", ") || "none"}.`,
      `Recommendations: ${recommendations.length}.`,
      `Conflicts detected: ${conflicts.length}.`,
      accepted ? "Decision accepted." : "Decision not fully accepted.",
    ];

    return freezeDecision({
      id: input.id,
      accepted,
      confidenceScore,
      recommendations: Object.freeze(recommendations),
      conflicts: Object.freeze(conflicts),
      prioritizedAgents,
      reasons: Object.freeze(reasons),
      metadata: EMPTY_COACH_METADATA,
      decidedAt: input.decidedAt,
    });
  }
}

export function createCoachResultMerger(): CoachResultMerger {
  return new CoachResultMerger();
}
