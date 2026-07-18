import { DecisionInput } from "../../decision/models/DecisionInput";
import { DecisionType } from "../../decision/models/DecisionType";
import { DecisionEngine } from "../../decision/services/DecisionEngine";
import { MemoryManager } from "../../memory/services/MemoryManager";
import { ProfileService } from "../../profile/services/ProfileService";
import { CoachResponse } from "../models/CoachResponse";
import { SuggestionService } from "./SuggestionService";

export class CoachService {
  constructor(
    private readonly decisionEngine: DecisionEngine,
    private readonly suggestionService: SuggestionService,
    private readonly memoryManager: MemoryManager,
    private readonly profileService: ProfileService,
  ) {}

  private readonly messagesByDecisionType: Record<DecisionType, string> = {
    [DecisionType.KEEP_PLAN]: "Keep following your current training plan.",
    [DecisionType.MODIFY_PLAN]: "Your training plan should be adjusted.",
    [DecisionType.REDUCE_VOLUME]: "Reduce today's training volume.",
    [DecisionType.INCREASE_VOLUME]: "You're ready for a higher training volume.",
    [DecisionType.CHANGE_EXERCISE]: "Consider changing today's exercise selection.",
    [DecisionType.ADD_DELOAD]: "A deload week is recommended.",
    [DecisionType.REST_DAY]: "Take a recovery day.",
  };

  async evaluate(input: DecisionInput): Promise<CoachResponse> {
    const decision = this.decisionEngine.evaluate(input);
    const memories = await this.memoryManager.getAll();
    const athleteProfile = this.profileService.buildProfile(memories);

    const context = {
      decision,
      profile: athleteProfile,
    };

    const suggestions = this.suggestionService.getSuggestions(context);

    return {
      message: this.messagesByDecisionType[decision.type],
      decision,
      suggestions,
      profile: {
        profile: athleteProfile,
      },
    };
  }
}
