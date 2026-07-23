import type { WorkoutRecommendation } from "../models/WorkoutRecommendation";
import { WorkoutRecommendationCategories } from "../models/WorkoutRecommendation";
import {
  labelFromScore,
} from "../models/WorkoutConfidence";
import type { WorkoutDecision } from "../models/WorkoutDecision";
import type { WorkoutPlanProposal } from "../models/WorkoutPlanProposal";
import { freezeRecommendation } from "../utils/freezeAgentState";
import { volumeLabel } from "../utils/volumeHelpers";
import { intensityLabel } from "../utils/intensityHelpers";

export class RecommendationSelector {
  select(input: {
    readonly decision: WorkoutDecision;
    readonly proposal: WorkoutPlanProposal | null;
  }): readonly WorkoutRecommendation[] {
    const items: WorkoutRecommendation[] = [];
    const proposal = input.proposal;

    if (proposal) {
      items.push(
        freezeRecommendation({
          id: `rec:volume:${proposal.id}`,
          category: WorkoutRecommendationCategories.VOLUME,
          title: "Volume target",
          detail: `Aim for ${volumeLabel(proposal.volumeScore)} weekly volume.`,
          priority: 70,
          confidence: Object.freeze({
            score: proposal.confidence.score,
            label: labelFromScore(proposal.confidence.score),
            rationale: null,
          }),
          relatedExerciseIds: Object.freeze([...proposal.primaryLifts]),
        }),
      );
      items.push(
        freezeRecommendation({
          id: `rec:intensity:${proposal.id}`,
          category: WorkoutRecommendationCategories.INTENSITY,
          title: "Intensity target",
          detail: `Train at ${intensityLabel(proposal.intensityScore)} relative intensity.`,
          priority: 65,
          confidence: Object.freeze({
            score: proposal.confidence.score,
            label: labelFromScore(proposal.confidence.score),
            rationale: null,
          }),
          relatedExerciseIds: Object.freeze([] as string[]),
        }),
      );
      if (proposal.progressionCue) {
        items.push(
          freezeRecommendation({
            id: `rec:progression:${proposal.id}`,
            category: WorkoutRecommendationCategories.PROGRESSION,
            title: "Progression",
            detail: proposal.progressionCue,
            priority: 80,
            confidence: proposal.confidence,
            relatedExerciseIds: Object.freeze([...proposal.primaryLifts]),
          }),
        );
      }
      if (proposal.deloadRecommended) {
        items.push(
          freezeRecommendation({
            id: `rec:recovery:${proposal.id}`,
            category: WorkoutRecommendationCategories.RECOVERY,
            title: "Recovery",
            detail: "A deload is recommended.",
            priority: 90,
            confidence: Object.freeze({
              score: 0.8,
              label: labelFromScore(0.8),
              rationale: "Fatigue/recovery signals elevated.",
            }),
            relatedExerciseIds: Object.freeze([] as string[]),
          }),
        );
      }
    }

    if (!input.decision.accepted) {
      items.push(
        freezeRecommendation({
          id: `rec:general:${input.decision.id}`,
          category: WorkoutRecommendationCategories.GENERAL,
          title: "Review required",
          detail: "Decision was not accepted — review policy flags.",
          priority: 100,
          confidence: input.decision.confidence,
          relatedExerciseIds: Object.freeze([] as string[]),
        }),
      );
    }

    return Object.freeze(items);
  }
}
