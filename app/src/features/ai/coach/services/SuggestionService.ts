import { Decision } from "../../decision/models/Decision";
import { DecisionType } from "../../decision/models/DecisionType";
import { AthleteGoal } from "../../profile/models/AthleteGoal";
import { AthleteProfile } from "../../profile/models/AthleteProfile";
import { DeadliftStyle } from "../../profile/models/DeadliftStyle";
import { ExperienceLevel } from "../../profile/models/ExperienceLevel";
import { SquatStyle } from "../../profile/models/SquatStyle";
import { SuggestionContext } from "../models/SuggestionContext";

export class SuggestionService {
  getSuggestions(context: SuggestionContext): string[] {
    const suggestions = this.getDecisionSuggestions(context.decision);

    this.addUnique(suggestions, this.getGoalSuggestion(context.profile.goal));
    this.addUnique(suggestions, this.getSquatStyleSuggestion(context.profile.squatStyle));
    this.addUnique(suggestions, this.getDeadliftStyleSuggestion(context.profile.deadliftStyle));
    this.addUnique(suggestions, this.getExperienceSuggestion(context.profile.experience));

    for (const preference of context.profile.preferences) {
      this.addUnique(suggestions, this.getPreferenceSuggestion(preference));
    }

    for (const limitation of context.profile.limitations) {
      this.addUnique(suggestions, this.getLimitationSuggestion(limitation));
    }

    return suggestions;
  }

  private getDecisionSuggestions(decision: Decision): string[] {
    switch (decision.type) {
      case DecisionType.KEEP_PLAN:
        return ["Stay consistent with today's workout.", "Focus on proper technique."];
      case DecisionType.MODIFY_PLAN:
        return ["Review today's training session.", "Adjust the workload if needed."];
      case DecisionType.REDUCE_VOLUME:
        return [
          "Reduce the number of working sets.",
          "Avoid training to failure.",
          "Prioritize recovery.",
        ];
      case DecisionType.INCREASE_VOLUME:
        return ["Increase training volume gradually.", "Monitor recovery carefully."];
      case DecisionType.CHANGE_EXERCISE:
        return ["Replace painful movements.", "Choose an equivalent exercise."];
      case DecisionType.ADD_DELOAD:
        return ["Reduce intensity this week.", "Focus on mobility and recovery."];
      case DecisionType.REST_DAY:
        return ["Prioritize sleep.", "Stay hydrated.", "Perform light mobility work."];
      default:
        return [];
    }
  }

  private getGoalSuggestion(goal: AthleteGoal): string | null {
    if (goal === AthleteGoal.CUT) {
      return "Monitor recovery carefully during your cutting phase.";
    }

    if (goal === AthleteGoal.BULK) {
      return "Ensure sufficient caloric intake to support recovery.";
    }

    return null;
  }

  private getSquatStyleSuggestion(squatStyle: SquatStyle): string | null {
    if (squatStyle === SquatStyle.LOW_BAR) {
      return "Continue using your preferred low bar squat technique.";
    }

    return null;
  }

  private getDeadliftStyleSuggestion(deadliftStyle: DeadliftStyle): string | null {
    if (deadliftStyle === DeadliftStyle.SUMO) {
      return "Use your preferred sumo deadlift stance.";
    }

    return null;
  }

  private getExperienceSuggestion(experience: ExperienceLevel): string | null {
    if (experience === ExperienceLevel.ADVANCED) {
      return "As an advanced athlete, prioritize proactive recovery between sessions.";
    }

    return null;
  }

  private getPreferenceSuggestion(preference: string): string {
    return `Personalized suggestion based on your preference: ${preference}.`;
  }

  private getLimitationSuggestion(limitation: string): string {
    return `Avoid aggravating movements and prioritize recovery: ${limitation}.`;
  }

  private addUnique(suggestions: string[], suggestion: string | null): void {
    if (suggestion !== null && !suggestions.includes(suggestion)) {
      suggestions.push(suggestion);
    }
  }
}
