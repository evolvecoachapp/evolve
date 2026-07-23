export type PromptPriority = number;

export const PROMPT_PRIORITY_MIN = 1;
export const PROMPT_PRIORITY_MAX = 100;
export const PROMPT_PRIORITY_DEFAULT = 50;

export function isValidPromptPriority(value: number): boolean {
  return (
    Number.isFinite(value) &&
    value >= PROMPT_PRIORITY_MIN &&
    value <= PROMPT_PRIORITY_MAX
  );
}
