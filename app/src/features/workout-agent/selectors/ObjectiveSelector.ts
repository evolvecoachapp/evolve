import type { WorkoutIntent } from "../models/WorkoutIntent";
import { WorkoutIntents } from "../models/WorkoutIntent";
import type { WorkoutObjective } from "../models/WorkoutObjective";
import { WorkoutObjectives } from "../models/WorkoutObjective";

export class ObjectiveSelector {
  select(input: {
    readonly objectiveHint: WorkoutObjective | null;
    readonly intent: WorkoutIntent;
    readonly message: string;
  }): WorkoutObjective {
    if (input.objectiveHint && input.objectiveHint !== WorkoutObjectives.UNKNOWN) {
      return input.objectiveHint;
    }
    const text = input.message.toLowerCase();
    if (/powerlift|meet prep|1rm/.test(text)) {
      return WorkoutObjectives.POWERLIFTING;
    }
    if (/hypertroph|muscle|bodybuild/.test(text)) {
      return WorkoutObjectives.HYPERTROPHY;
    }
    if (/powerbuild/.test(text)) {
      return WorkoutObjectives.POWERBUILDING;
    }
    if (/strength|stronger/.test(text)) {
      return WorkoutObjectives.STRENGTH;
    }
    if (/recover|deload|rest/.test(text)) {
      return WorkoutObjectives.RECOVERY;
    }
    if (input.intent === WorkoutIntents.RECOVERY_ADVICE) {
      return WorkoutObjectives.RECOVERY;
    }
    if (/fitness|general|health/.test(text)) {
      return WorkoutObjectives.GENERAL_FITNESS;
    }
    return WorkoutObjectives.GENERAL_FITNESS;
  }
}
