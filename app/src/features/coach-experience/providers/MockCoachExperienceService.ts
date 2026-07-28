import {
  emptyCoachExperienceData,
  mockCoachExperienceData,
} from "../mocks/coachExperienceData";
import type {
  CoachConversationHistoryDto,
  CoachExperienceDto,
  CoachInsightDto,
  CoachMessageDto,
  CoachQuickActionDto,
  CoachRecommendationDto,
  CoachSendMessageResultDto,
} from "../types/coachExperienceDto";
import type { CoachExperienceService } from "../types/coachExperienceService";

const DEFAULT_RESPONSES = [
  "Got it. I'll factor that into your plan and keep monitoring how you respond in the next session.",
  "That's a smart question. Based on your recent training load, I'd keep intensity moderate today and reassess after your warm-up.",
  "I hear you. Let's prioritize consistency over pushing harder — small progress compounds quickly.",
  "Thanks for sharing. I'll adjust today's recommendation and flag anything that needs attention before your next workout.",
] as const;

const KEYWORD_RESPONSES: { pattern: RegExp; content: string }[] = [
  {
    pattern: /\b(weight|load|kg|lbs?|bench|squat|deadlift)\b/i,
    content:
      "Your recent sessions show steady progress. Add load gradually — about 2.5kg when you can complete all sets with solid form.",
  },
  {
    pattern: /\b(rest|recovery|sleep|sore|fatigue|tired)\b/i,
    content:
      "Recovery looks good overall. If soreness persists past 48 hours, drop intensity by one step and prioritize sleep and hydration tonight.",
  },
  {
    pattern: /\b(calorie|calories|protein|nutrition|macros?)\b/i,
    content:
      "Keep protein near your target and adjust calories by about 150–200 based on today's training demand.",
  },
  {
    pattern: /\b(motivat|encourage|inspire)\b/i,
    content:
      "You've built consistency — that is the hardest part. Show up for today's session with intent and let the work compound.",
  },
  {
    pattern: /\b(volume|reduce|deload)\b/i,
    content:
      "We can trim accessory volume by one set today while keeping the primary lifts intact. That protects recovery without losing stimulus.",
  },
  {
    pattern: /\b(progress|weekly|week)\b/i,
    content:
      "This week looks solid: workout adherence is high, recovery is trending up, and nutrition consistency is supporting your strength work.",
  },
];

function hashString(value: string): number {
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function pickMockResponse(message: string): string {
  const match = KEYWORD_RESPONSES.find(({ pattern }) => pattern.test(message));
  if (match) {
    return match.content;
  }
  const index = Math.abs(hashString(message)) % DEFAULT_RESPONSES.length;
  return DEFAULT_RESPONSES[index];
}

function createId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
}

function cloneExperience(dto: CoachExperienceDto): CoachExperienceDto {
  return {
    ...dto,
    conversation: {
      ...dto.conversation,
      messages: dto.conversation.messages.map((message) => ({ ...message })),
    },
    dailyInsight: dto.dailyInsight ? { ...dto.dailyInsight } : null,
    pinnedInsight: dto.pinnedInsight ? { ...dto.pinnedInsight } : null,
    recommendations: (dto.recommendations ?? []).map((item) => ({ ...item })),
    quickActions: (dto.quickActions ?? []).map((item) => ({ ...item })),
    memorySummary: dto.memorySummary ? { ...dto.memorySummary } : null,
    conversationHistory: (dto.conversationHistory ?? []).map((item) => ({
      ...item,
    })),
  };
}

let seed: CoachExperienceDto = cloneExperience(mockCoachExperienceData);

export function resetMockCoachExperienceSeed(
  dto: CoachExperienceDto = mockCoachExperienceData,
): void {
  seed = cloneExperience(dto);
}

export function getMockCoachExperienceSeed(): CoachExperienceDto {
  return cloneExperience(seed);
}

/** Default provider — deterministic mock AI replies + seeded experience. */
export const mockCoachExperienceService: CoachExperienceService = {
  providerId: "mock",

  async getExperience(): Promise<CoachExperienceDto> {
    return cloneExperience(seed);
  },

  async sendMessage(input: {
    readonly conversationId: string;
    readonly message: string;
  }): Promise<CoachSendMessageResultDto> {
    const now = new Date().toISOString();
    const userMessage: CoachMessageDto = {
      id: createId("user"),
      role: "user",
      content: input.message.trim(),
      createdAt: now,
    };
    const coachMessage: CoachMessageDto = {
      id: createId("coach"),
      role: "coach",
      content: pickMockResponse(input.message.trim()),
      createdAt: now,
      citations: ["coach-intelligence"],
    };

    if (seed.conversation.id === input.conversationId) {
      seed = {
        ...seed,
        conversation: {
          ...seed.conversation,
          messages: [...seed.conversation.messages, userMessage, coachMessage],
          updatedAt: now,
        },
      };
    }

    return {
      conversationId: input.conversationId,
      userMessage,
      coachMessage,
    };
  },

  async regenerateResponse(input: {
    readonly conversationId: string;
    readonly messageId: string;
  }): Promise<CoachMessageDto> {
    const now = new Date().toISOString();
    const existing = seed.conversation.messages.find(
      (message) => message.id === input.messageId,
    );
    const regenerated: CoachMessageDto = {
      id: createId("coach"),
      role: "coach",
      content: pickMockResponse(
        existing?.content ?? "Regenerate coaching response",
      ),
      createdAt: now,
      citations: ["coach-intelligence", "regenerated"],
    };

    if (seed.conversation.id === input.conversationId && existing) {
      seed = {
        ...seed,
        conversation: {
          ...seed.conversation,
          messages: seed.conversation.messages.map((message) =>
            message.id === input.messageId ? regenerated : message,
          ),
          updatedAt: now,
        },
      };
    }

    return regenerated;
  },

  async pinInsight(insightId: string): Promise<CoachInsightDto> {
    const candidate =
      seed.dailyInsight?.id === insightId
        ? seed.dailyInsight
        : seed.pinnedInsight?.id === insightId
          ? seed.pinnedInsight
          : null;

    if (!candidate) {
      throw new Error(`Insight not found: ${insightId}`);
    }

    const pinned: CoachInsightDto = {
      ...candidate,
      pinned: true,
      kind: "pinned",
    };
    seed = {
      ...seed,
      pinnedInsight: pinned,
      dailyInsight:
        seed.dailyInsight?.id === insightId
          ? { ...seed.dailyInsight, pinned: true }
          : seed.dailyInsight,
    };
    return { ...pinned };
  },

  async dismissInsight(insightId: string): Promise<void> {
    seed = {
      ...seed,
      dailyInsight:
        seed.dailyInsight?.id === insightId
          ? null
          : seed.dailyInsight
            ? { ...seed.dailyInsight }
            : null,
      pinnedInsight:
        seed.pinnedInsight?.id === insightId
          ? null
          : seed.pinnedInsight
            ? { ...seed.pinnedInsight }
            : null,
    };
  },

  async getConversationHistory(): Promise<
    readonly CoachConversationHistoryDto[]
  > {
    return [...(seed.conversationHistory ?? [])];
  },

  async getDailyInsight(): Promise<CoachInsightDto | null> {
    return seed.dailyInsight ? { ...seed.dailyInsight } : null;
  },

  async getRecommendations(): Promise<readonly CoachRecommendationDto[]> {
    return [...(seed.recommendations ?? [])];
  },

  async getQuickActions(): Promise<readonly CoachQuickActionDto[]> {
    return [...(seed.quickActions ?? [])];
  },
};

/** Empty mock variant for empty-state tests. */
export const emptyMockCoachExperienceService: CoachExperienceService = {
  ...mockCoachExperienceService,
  async getExperience(): Promise<CoachExperienceDto> {
    return cloneExperience(emptyCoachExperienceData);
  },
  async getDailyInsight(): Promise<CoachInsightDto | null> {
    return null;
  },
  async getRecommendations(): Promise<readonly CoachRecommendationDto[]> {
    return [];
  },
  async getQuickActions(): Promise<readonly CoachQuickActionDto[]> {
    return [];
  },
  async getConversationHistory(): Promise<
    readonly CoachConversationHistoryDto[]
  > {
    return [];
  },
};
