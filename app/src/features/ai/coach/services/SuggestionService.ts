import { Decision } from "../../decision/models/Decision";
import { DecisionType } from "../../decision/models/DecisionType";

export class SuggestionService {
  getSuggestions(decision: Decision): string[] {
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
}
