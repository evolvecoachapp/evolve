import { DecisionEngine } from "../../decision/services/DecisionEngine";
import { InMemoryRepository } from "../../memory/repository/InMemoryRepository";
import { MemoryEngine } from "../../memory/services/MemoryEngine";
import { MemoryManager } from "../../memory/services/MemoryManager";
import { ProfileService } from "../../profile/services/ProfileService";
import { CoachService } from "./CoachService";
import { SuggestionService } from "./SuggestionService";

export class CoachFactory {
  static create(): CoachService {
    const decisionEngine = new DecisionEngine();
    const suggestionService = new SuggestionService();
    const memoryManager = new MemoryManager(new MemoryEngine(new InMemoryRepository()));
    const profileService = new ProfileService();

    return new CoachService(decisionEngine, suggestionService, memoryManager, profileService);
  }
}
