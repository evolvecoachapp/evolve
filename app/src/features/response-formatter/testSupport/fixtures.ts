import { AIResponseBuilder } from "../../ai-provider/builders/AIResponseBuilder";
import { AIFinishReasons } from "../../ai-provider/models/AIFinishReason";
import type { AIResponse } from "../../ai-provider/models/AIResponse";
import { EMPTY_PROVIDER_METADATA } from "../../ai-provider/models/AIProviderMetadata";
import { ZERO_TOKEN_USAGE } from "../../ai-provider/models/AITokenUsage";
import { createResponseFormatterService } from "../services/ResponseFormatterService";

export const FIXED_TIMESTAMP = "2026-07-23T12:00:00.000Z";

export const STRUCTURED_COACH_CONTENT = `# Message
Focus on controlled tempo and full range of motion.

## Recommendations
- Add a third set of back squats this week
- Prioritize protein intake after training
- Improve bracing technique on heavy pulls

## Warnings
- Stop immediately if sharp knee pain appears

## Actions
- Start workout: Lower body strength
- Log metric: RPE after main lifts

## Exercises
- Back Squat | 3 | 5
- Romanian Deadlift — 3x8 — soft knees

## Nutrition
- Eat 30g protein post-session (within 1 hour)

## Recovery
- Sleep: Aim for 8 hours tonight
- Mobility: Hip openers after training

## Questions
- How sore are your quads today? (optional)

## Citations
- [NSCA Strength Guidelines](https://example.com/nsca)

## Insights
- Progress has been consistent over the last two weeks

## Reasoning
Volume can increase because recovery markers look stable.

## Confidence
0.82
`;

export function createAIResponseFixture(
  overrides: {
    readonly id?: string;
    readonly requestId?: string;
    readonly providerId?: string;
    readonly modelId?: string | null;
    readonly content?: string;
    readonly createdAt?: string;
  } = {},
): AIResponse {
  return new AIResponseBuilder()
    .withId(overrides.id ?? "ai-resp:1")
    .withRequestId(overrides.requestId ?? "ai-req:1")
    .withProviderId(overrides.providerId ?? "openai")
    .withModelId(overrides.modelId ?? "gpt-test")
    .withContent(overrides.content ?? STRUCTURED_COACH_CONTENT)
    .withFinishReason(AIFinishReasons.STOP)
    .withUsage(ZERO_TOKEN_USAGE)
    .withMetadata(EMPTY_PROVIDER_METADATA)
    .withCreatedAt(overrides.createdAt ?? FIXED_TIMESTAMP)
    .build();
}

export function createPlainAIResponseFixture(
  content = "Keep sessions short and focus on recovery.",
): AIResponse {
  return createAIResponseFixture({
    id: "ai-resp:plain",
    content,
  });
}

export function createTestFormatterHarness() {
  const service = createResponseFormatterService();
  return { service };
}
