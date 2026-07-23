import type { WorkoutDecision } from "../models/WorkoutDecision";
import type { WorkoutPlanProposal } from "../models/WorkoutPlanProposal";
import type { WorkoutRecommendation } from "../models/WorkoutRecommendation";
import { RecommendationSelector } from "../selectors/RecommendationSelector";

export class WorkoutRecommendationBuilder {
  constructor(
    private readonly selector = new RecommendationSelector(),
  ) {}

  build(input: {
    readonly decision: WorkoutDecision;
    readonly proposal: WorkoutPlanProposal | null;
  }): readonly WorkoutRecommendation[] {
    return this.selector.select(input);
  }
}
