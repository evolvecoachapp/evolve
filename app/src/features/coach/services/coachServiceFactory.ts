import type { CoachProviderId, CoachService } from "../types/coachService";
import { anthropicService } from "./providers/AnthropicService";
import { futureLocalLLMService } from "./providers/FutureLocalLLMService";
import { mockCoachService } from "./providers/MockCoachService";
import { openAIService } from "./providers/OpenAIService";

const PROVIDERS: Record<CoachProviderId, CoachService> = {
  mock: mockCoachService,
  openai: openAIService,
  anthropic: anthropicService,
  local: futureLocalLLMService,
};

/** Resolves the active provider from env — defaults to mock when unset or unknown. */
export function resolveCoachProviderId(): CoachProviderId {
  const configured = process.env.EXPO_PUBLIC_COACH_PROVIDER as CoachProviderId | undefined;
  if (configured && configured in PROVIDERS) {
    return configured;
  }
  return "mock";
}

export function createCoachService(providerId: CoachProviderId = resolveCoachProviderId()): CoachService {
  return PROVIDERS[providerId];
}
