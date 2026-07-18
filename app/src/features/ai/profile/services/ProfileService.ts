import { MemoryEntry } from "../../memory/models/MemoryEntry";
import { AthleteGoal } from "../models/AthleteGoal";
import { AthleteProfile } from "../models/AthleteProfile";
import { DeadliftStyle } from "../models/DeadliftStyle";
import { ExperienceLevel } from "../models/ExperienceLevel";
import { SquatStyle } from "../models/SquatStyle";

export class ProfileService {
  buildProfile(memories: MemoryEntry[]): AthleteProfile {
    const profile: AthleteProfile = {
      goal: AthleteGoal.UNKNOWN,
      squatStyle: SquatStyle.UNKNOWN,
      deadliftStyle: DeadliftStyle.UNKNOWN,
      experience: ExperienceLevel.UNKNOWN,
      preferences: [],
      limitations: [],
    };

    for (const memory of memories) {
      const content = this.getMemoryContent(memory);
      const lowerContent = content.toLowerCase();

      profile.goal = this.inferGoal(lowerContent, profile.goal);
      profile.squatStyle = this.inferSquatStyle(lowerContent, profile.squatStyle);
      profile.deadliftStyle = this.inferDeadliftStyle(lowerContent, profile.deadliftStyle);
      profile.experience = this.inferExperience(lowerContent, profile.experience);

      if (this.isPreference(lowerContent)) {
        this.addUnique(profile.preferences, content);
      }

      if (this.isLimitation(lowerContent)) {
        this.addUnique(profile.limitations, content);
      }
    }

    return profile;
  }

  private getMemoryContent(memory: MemoryEntry): string {
    const valueText = typeof memory.value === "string" ? memory.value : "";
    return `${memory.title} ${valueText}`.trim();
  }

  private inferGoal(content: string, current: AthleteGoal): AthleteGoal {
    if (content.includes("cut")) {
      return AthleteGoal.CUT;
    }

    if (content.includes("bulk")) {
      return AthleteGoal.BULK;
    }

    if (content.includes("maintenance")) {
      return AthleteGoal.MAINTENANCE;
    }

    return current;
  }

  private inferSquatStyle(content: string, current: SquatStyle): SquatStyle {
    if (content.includes("low bar")) {
      return SquatStyle.LOW_BAR;
    }

    if (content.includes("high bar")) {
      return SquatStyle.HIGH_BAR;
    }

    return current;
  }

  private inferDeadliftStyle(content: string, current: DeadliftStyle): DeadliftStyle {
    if (content.includes("sumo")) {
      return DeadliftStyle.SUMO;
    }

    if (content.includes("conventional")) {
      return DeadliftStyle.CONVENTIONAL;
    }

    return current;
  }

  private inferExperience(content: string, current: ExperienceLevel): ExperienceLevel {
    if (content.includes("beginner")) {
      return ExperienceLevel.BEGINNER;
    }

    if (content.includes("intermediate")) {
      return ExperienceLevel.INTERMEDIATE;
    }

    if (content.includes("advanced")) {
      return ExperienceLevel.ADVANCED;
    }

    return current;
  }

  private isPreference(content: string): boolean {
    return content.includes("prefer") || content.includes("favorite") || content.includes("like");
  }

  private isLimitation(content: string): boolean {
    return content.includes("pain") || content.includes("injury") || content.includes("avoid");
  }

  private addUnique(list: string[], value: string): void {
    if (!list.includes(value)) {
      list.push(value);
    }
  }
}
