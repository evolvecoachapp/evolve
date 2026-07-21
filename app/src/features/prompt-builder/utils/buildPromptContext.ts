import type { AthleteProfile } from "../../athlete-context/models/AthleteProfile";
import type { CoachIntelligenceSnapshot } from "../../coach-intelligence/repository/CoachIntelligenceRepository";
import type { PromptContext } from "../models/PromptContext";
import { buildAthleteContext } from "./buildAthleteContext";
import { buildCoachContext } from "./buildCoachContext";
import { buildMetadata } from "./buildMetadata";
import { buildPerformanceContext } from "./buildPerformanceContext";
import { buildSections } from "./buildSections";
import { buildTrainingContext } from "./buildTrainingContext";

export interface BuildPromptContextOptions {
  /** ISO-8601 override for when the prompt context was built. */
  readonly generatedAt?: string;
  /** Athlete identity from Athlete Context domain. */
  readonly profile: AthleteProfile;
}

/**
 * Assemble a complete PromptContext from coach intelligence and athlete context.
 *
 * Pure and deterministic — no formatting, markdown, or serialization.
 */
export function buildPromptContext(
  snapshot: CoachIntelligenceSnapshot,
  options: BuildPromptContextOptions,
): PromptContext {
  const generatedAt =
    options.generatedAt ?? new Date().toISOString();

  return Object.freeze({
    athlete: buildAthleteContext(snapshot.summary),
    profile: options.profile,
    training: buildTrainingContext(snapshot.summary),
    performance: buildPerformanceContext({
      summary: snapshot.summary,
      insights: snapshot.insights,
    }),
    coach: buildCoachContext({
      riskFlags: snapshot.riskFlags,
      recommendations: snapshot.recommendations,
      insights: snapshot.insights,
    }),
    metadata: buildMetadata({
      summary: snapshot.summary,
      generatedAt,
    }),
    sections: buildSections(),
  });
}
