import type { PromptIntent } from "../models/PromptIntent";
import { PROMPT_INTENTS } from "../models/PromptIntent";
import { validateIntent } from "../validators";

interface IntentRule {
  readonly intent: Exclude<PromptIntent, "UNKNOWN" | "GENERAL_CHAT">;
  readonly patterns: readonly RegExp[];
}

/**
 * Ordered keyword rules — first match wins.
 * GENERAL_CHAT is a fallback for greetings; UNKNOWN when nothing matches.
 */
const INTENT_RULES: readonly IntentRule[] = Object.freeze([
  {
    intent: "WORKOUT",
    patterns: Object.freeze([
      /\bworkout\b/i,
      /\btrain(ing)?\b/i,
      /\bsession\b/i,
      /\blift(ing|s)?\b/i,
      /\bsets?\b/i,
      /\breps?\b/i,
      /\bexercise\b/i,
    ]),
  },
  {
    intent: "PROGRAM",
    patterns: Object.freeze([
      /\bprogram\b/i,
      /\bmesocycle\b/i,
      /\bperiodiz/i,
      /\bsplit\b/i,
      /\bplan\b/i,
      /\bschedule\b/i,
    ]),
  },
  {
    intent: "NUTRITION",
    patterns: Object.freeze([
      /\bnutrition\b/i,
      /\bdiet\b/i,
      /\bcalorie/i,
      /\bprotein\b/i,
      /\bmeal\b/i,
      /\beat(ing|s)?\b/i,
      /\bmacros?\b/i,
    ]),
  },
  {
    intent: "RECOVERY",
    patterns: Object.freeze([
      /\brecover(y|ing)?\b/i,
      /\bsore(ness)?\b/i,
      /\bfatigue\b/i,
      /\brest\b/i,
      /\bsleep\b/i,
      /\bdeload\b/i,
    ]),
  },
  {
    intent: "TECHNIQUE",
    patterns: Object.freeze([
      /\btechnique\b/i,
      /\bform\b/i,
      /\bcue\b/i,
      /\bhow\s+do\s+i\s+(squat|bench|deadlift|press)\b/i,
      /\bmobility\b/i,
    ]),
  },
  {
    intent: "GOAL",
    patterns: Object.freeze([
      /\bgoal\b/i,
      /\btarget\b/i,
      /\bobjective\b/i,
      /\bwant\s+to\s+(gain|lose|build|cut)\b/i,
    ]),
  },
  {
    intent: "PROGRESS",
    patterns: Object.freeze([
      /\bprogress\b/i,
      /\bpr\b/i,
      /\bpersonal\s+record\b/i,
      /\bplateau\b/i,
      /\bimproving\b/i,
      /\bstagnation\b/i,
      /\btrend\b/i,
    ]),
  },
]);

const GENERAL_CHAT_PATTERNS: readonly RegExp[] = Object.freeze([
  /^(hi|hello|hey|thanks|thank you|ok|okay)\b/i,
  /\bhow are you\b/i,
  /\bgood (morning|afternoon|evening)\b/i,
]);

/**
 * Rule-based intent detection — no AI classification.
 */
export function detectPromptIntent(message: string): PromptIntent {
  const text = message.trim();
  if (text.length === 0) {
    return "UNKNOWN";
  }

  for (const rule of INTENT_RULES) {
    if (rule.patterns.some((pattern) => pattern.test(text))) {
      return rule.intent;
    }
  }

  if (GENERAL_CHAT_PATTERNS.some((pattern) => pattern.test(text))) {
    return "GENERAL_CHAT";
  }

  return "UNKNOWN";
}

/** Resolve intent from override or message text. */
export function resolvePromptIntent(
  message: string,
  intentOverride?: PromptIntent,
): PromptIntent {
  if (intentOverride !== undefined) {
    const issues = validateIntent(intentOverride);
    if (issues.length === 0 && (PROMPT_INTENTS as readonly string[]).includes(intentOverride)) {
      return intentOverride;
    }
  }
  return detectPromptIntent(message);
}
