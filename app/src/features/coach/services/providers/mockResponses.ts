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
    pattern: /\b(cardio|run|zone|endurance)\b/i,
    content:
      "For today, keep cardio in zone 2 for 20–30 minutes after your strength work. That supports recovery without adding excess fatigue.",
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

export function pickMockCoachResponse(message: string): string {
  const match = KEYWORD_RESPONSES.find(({ pattern }) => pattern.test(message));
  if (match) {
    return match.content;
  }

  const index = Math.abs(hashString(message)) % DEFAULT_RESPONSES.length;
  return DEFAULT_RESPONSES[index];
}
