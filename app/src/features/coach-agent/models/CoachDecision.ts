import type { CoachMetadata } from "./CoachMetadata";
import type { SpecialistAgentKind } from "./SpecialistAgentKind";

/**
 * Unified coaching recommendation merged from specialist outputs.
 */
export interface CoachRecommendation {
  readonly id: string;
  readonly sourceAgent: SpecialistAgentKind;
  readonly sourceRecommendationId: string | null;
  readonly category: string;
  readonly title: string;
  readonly detail: string;
  readonly priority: number;
  readonly confidenceScore: number;
}

export const CoachConflictKinds = Object.freeze({
  PRIORITY: "priority" as const,
  DOMAIN: "domain" as const,
  ACCEPTANCE: "acceptance" as const,
  SUCCESS: "success" as const,
});

export type CoachConflictKind =
  (typeof CoachConflictKinds)[keyof typeof CoachConflictKinds];

/**
 * Detected conflict between specialist agent outputs.
 */
export interface CoachConflict {
  readonly id: string;
  readonly kind: CoachConflictKind;
  readonly agents: readonly SpecialistAgentKind[];
  readonly description: string;
  readonly resolved: boolean;
  readonly resolution: string | null;
}

/**
 * Immutable coaching decision produced by deterministic merging.
 */
export interface CoachDecision {
  readonly id: string;
  readonly accepted: boolean;
  readonly confidenceScore: number;
  readonly recommendations: readonly CoachRecommendation[];
  readonly conflicts: readonly CoachConflict[];
  readonly prioritizedAgents: readonly SpecialistAgentKind[];
  readonly reasons: readonly string[];
  readonly metadata: CoachMetadata;
  readonly decidedAt: string;
}

/** Alias matching sprint naming. */
export type CoachDecisionResult = CoachDecision;
