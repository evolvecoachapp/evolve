import type { CoachIntent } from "../models/CoachIntent";

export function formatCountPhrase(count: number, noun: string): string {
  const plural = count === 1 ? noun : `${noun}s`;
  return `${count} ${plural}`;
}

export function formatIntentLabel(intent: CoachIntent): string {
  return intent.replace(/_/g, " ");
}
